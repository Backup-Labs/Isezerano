from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Category, Tag, Article, ArticleRevision, Comment
from users.serializers import UserSerializer

User = get_user_model()

class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'color_accent', 'parent', 'order', 'subcategories')

    def get_subcategories(self, obj):
        children = obj.subcategories.all()
        return CategorySerializer(children, many=True).data

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', 'slug')

class ArticleListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Article
        fields = (
            'id', 'title', 'slug', 'subtitle', 'cover_image', 'category', 'tags',
            'author', 'status', 'published_at', 'is_breaking', 'is_featured', 
            'is_premium', 'reading_time', 'view_count'
        )

class ArticleRevisionSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = ArticleRevision
        fields = ('id', 'article', 'author', 'title', 'subtitle', 'body', 'created_at')

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ('id', 'article', 'user', 'parent', 'body', 'status', 'created_at', 'replies')
        read_only_fields = ('id', 'user', 'status', 'created_at')

    def get_replies(self, obj):
        # Only return approved replies to nested depth
        approved_replies = obj.replies.filter(status='approved')
        return CommentSerializer(approved_replies, many=True).data

class ArticleDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    co_authors = UserSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    revisions = ArticleRevisionSerializer(many=True, read_only=True)

    class Meta:
        model = Article
        fields = (
            'id', 'title', 'slug', 'subtitle', 'body', 'cover_image', 'category', 'tags',
            'author', 'co_authors', 'status', 'published_at', 'is_breaking', 'is_featured', 
            'is_premium', 'reading_time', 'view_count', 'seo_title', 'seo_description',
            'created_at', 'updated_at', 'comments', 'revisions'
        )

    def get_comments(self, obj):
        # Threaded comments: only return top-level (parent is null) and approved comments
        top_level_comments = obj.comments.filter(parent__isnull=True, status='approved')
        return CommentSerializer(top_level_comments, many=True).data
