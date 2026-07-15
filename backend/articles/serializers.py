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
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = (
            'id', 'title', 'slug', 'subtitle', 'cover_image', 'category', 'tags',
            'author', 'status', 'published_at', 'is_breaking', 'is_featured', 
            'is_premium', 'reading_time', 'view_count'
        )

    def get_cover_image(self, obj):
        if not obj.cover_image:
            return None
        name = obj.cover_image.name
        if name.startswith('http://') or name.startswith('https://'):
            return name
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.cover_image.url)
        return obj.cover_image.url

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
    cover_image = serializers.SerializerMethodField()
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

    def get_cover_image(self, obj):
        if not obj.cover_image:
            return None
        name = obj.cover_image.name
        if name.startswith('http://') or name.startswith('https://'):
            return name
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.cover_image.url)
        return obj.cover_image.url

    def get_comments(self, obj):
        # Threaded comments: only return top-level (parent is null) and approved comments
        top_level_comments = obj.comments.filter(parent__isnull=True, status='approved')
        return CommentSerializer(top_level_comments, many=True).data


class CMSArticleWriteSerializer(serializers.ModelSerializer):
    """
    Write-only serializer for CMS article create/update.
    Accepts category as an integer PK and tags as a list of integer PKs.
    Boolean fields (is_breaking, is_featured, is_premium) accept string 'true'/'false'
    from multipart/form-data in addition to booleans.
    """
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        required=False,
        allow_null=True
    )
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        required=False
    )

    class Meta:
        model = Article
        fields = (
            'title', 'subtitle', 'body', 'cover_image', 'category', 'tags',
            'status', 'is_breaking', 'is_featured', 'is_premium',
            'seo_title', 'seo_description'
        )

    def to_internal_value(self, data):
        # Coerce string booleans from multipart form-data to real booleans
        mutable = data.copy() if hasattr(data, 'copy') else dict(data)
        for field in ('is_breaking', 'is_featured', 'is_premium'):
            val = mutable.get(field)
            if isinstance(val, str):
                mutable[field] = val.lower() in ('true', '1', 'yes')
        # Handle empty category string -> None
        if mutable.get('category') == '' or mutable.get('category') == 'null':
            mutable['category'] = None
        return super().to_internal_value(mutable)

    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        article = Article.objects.create(**validated_data)
        article.tags.set(tags)
        return article

    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags is not None:
            instance.tags.set(tags)
        return instance
