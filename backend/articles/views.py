from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Category, Tag, Article, ArticleRevision, Comment
from .serializers import (
    CategorySerializer, TagSerializer, ArticleListSerializer, 
    ArticleDetailSerializer, CommentSerializer, ArticleRevisionSerializer,
    CMSArticleWriteSerializer
)
from users.permissions import IsJournalist, IsEditor, IsAdmin

# ================= PUBLIC API VIEWS =================

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(parent__isnull=True)
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)

class TagListView(generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = (permissions.AllowAny,)

class ArticleListView(generics.ListAPIView):
    serializer_class = ArticleListSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        # Public only sees published articles
        queryset = Article.objects.filter(status='published', published_at__lte=timezone.now())
        
        # Filtering
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
            
        tag_slug = self.request.query_params.get('tag')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)
            
        author_username = self.request.query_params.get('author')
        if author_username:
            queryset = queryset.filter(author__username=author_username)
            
        is_breaking = self.request.query_params.get('is_breaking')
        if is_breaking is not None:
            queryset = queryset.filter(is_breaking=is_breaking.lower() == 'true')
            
        is_featured = self.request.query_params.get('is_featured')
        if is_featured is not None:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
            
        is_premium = self.request.query_params.get('is_premium')
        if is_premium is not None:
            queryset = queryset.filter(is_premium=is_premium.lower() == 'true')
            
        # Search queries
        search_query = self.request.query_params.get('q')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(subtitle__icontains=search_query) | 
                Q(body__icontains=search_query)
            )
            
        return queryset

class ArticleDetailView(generics.RetrieveAPIView):
    queryset = Article.objects.filter(status='published')
    serializer_class = ArticleDetailSerializer
    lookup_field = 'slug'
    permission_classes = (permissions.AllowAny,)

    def get_object(self):
        obj = super().get_object()
        # Increment view count
        obj.view_count += 1
        obj.save(update_fields=['view_count'])
        return obj

class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        article_slug = self.kwargs.get('slug')
        article = get_object_or_404(Article, slug=article_slug)
        
        # Optional: check site setting if comments require moderation before approval.
        # For now, default to approved.
        serializer.save(user=self.request.user, article=article, status='approved')

class ArticleCommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        slug = self.kwargs.get('slug')
        return Comment.objects.filter(article__slug=slug, parent__isnull=True, status='approved')

# ================= CMS (ADMIN/STAFF) API VIEWS =================

class CMSArticleViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleDetailSerializer
    permission_classes = (IsJournalist,)

    def get_serializer_class(self):
        # Use the write serializer for create/update, detail serializer for reads
        if self.action in ('create', 'update', 'partial_update'):
            return CMSArticleWriteSerializer
        return ArticleDetailSerializer

    def get_queryset(self):
        user = self.request.user
        # Admins and Editors can manage all articles
        if user.role in ['admin', 'editor'] or user.is_superuser:
            return Article.objects.all()
        # Journalists can only view/manage their own drafts or review status articles
        return Article.objects.filter(Q(author=user) | Q(co_authors=user)).distinct()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.instance
        old_title = instance.title
        old_subtitle = instance.subtitle
        old_body = instance.body

        # Save model details
        article = serializer.save()

        # Create ArticleRevision entry on changes
        if (old_title != article.title or 
            old_subtitle != article.subtitle or 
            old_body != article.body):
            ArticleRevision.objects.create(
                article=article,
                author=self.request.user,
                title=old_title,
                subtitle=old_subtitle,
                body=old_body
            )

    @action(detail=True, methods=['post'], permission_classes=[IsEditor])
    def publish(self, request, pk=None):
        article = self.get_object()
        article.status = 'published'
        article.published_at = timezone.now()
        article.save()
        return Response({'status': 'article published'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsEditor])
    def reject(self, request, pk=None):
        article = self.get_object()
        article.status = 'draft'
        article.save()
        return Response({'status': 'article returned to draft'}, status=status.HTTP_200_OK)

class CMSCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (IsEditor,)

class CMSTagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = (IsEditor,)

class CMSCommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = (IsEditor,)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        comment = self.get_object()
        comment.status = 'approved'
        comment.save()
        return Response({'status': 'comment approved'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        comment = self.get_object()
        comment.status = 'flagged'
        comment.save()
        return Response({'status': 'comment flagged'}, status=status.HTTP_200_OK)
