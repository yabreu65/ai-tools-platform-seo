'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  User, 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  Tag, 
  ArrowLeft,
  MessageCircle,
  ThumbsUp,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon
} from 'lucide-react';
import { useBlog } from '@/contexts/BlogContext';
import { BlogPost } from '@/types/content';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const {
    currentPost,
    comments,
    loading,
    error,
    fetchPost,
    fetchComments,
    addComment,
    likePost,
    likeComment,
    trackView,
    getRelatedPosts
  } = useBlog();

  const [liked, setLiked] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentForm, setCommentForm] = useState({
    author: { name: '', email: '', avatar: '' },
    content: ''
  });
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (slug) {
      fetchPost(slug).then(post => {
        if (post) {
          fetchComments(post.id);
          trackView(post.id);
        }
      });
    }
  }, [slug]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  const handleLike = async () => {
    if (currentPost && !liked) {
      await likePost(currentPost.id);
      setLiked(true);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    await likeComment(commentId);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPost && commentForm.content.trim() && commentForm.author.name.trim()) {
      await addComment(currentPost.id, {
        author: {
          name: commentForm.author.name,
          email: commentForm.author.email,
          avatar: commentForm.author.avatar || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20friendly%20professional&image_size=square'
        },
        content: commentForm.content,
        postId: currentPost.id
      });
      setCommentForm({ author: { name: '', email: '', avatar: '' }, content: '' });
      setShowCommentForm(false);
    }
  };

  const shareOnSocial = (platform: string) => {
    if (!currentPost) return;
    
    const text = `${currentPost.title} - ${currentPost.excerpt}`;
    const url = shareUrl;
    
    let shareLink = '';
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Artículo no encontrado'}
          </h2>
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = getRelatedPosts(currentPost.id, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al blog
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-3 py-1 text-sm font-medium text-white rounded-full"
                style={{ backgroundColor: currentPost.category.color }}
              >
                {currentPost.category.icon} {currentPost.category.name}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {currentPost.title}
            </h1>

            <p className="text-xl text-gray-600 mb-6">
              {currentPost.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Image
                  src={currentPost.author.avatar || '/default-avatar.png'}
                  alt={currentPost.author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="font-medium">{currentPost.author.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(currentPost.publishedAt)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {currentPost.readingTime} min de lectura
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {currentPost.views.toLocaleString()} vistas
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              {/* Featured Image */}
              <div className="relative h-64 md:h-80">
                <Image
                  src={currentPost.featuredImage || '/default-blog-image.jpg'}
                  alt={currentPost.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-3xl font-bold text-gray-900 mb-4">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-8">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xl font-bold text-gray-900 mb-2 mt-6">{children}</h3>,
                      p: ({ children }) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-700">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                      code: ({ children }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{children}</code>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">
                          {children}
                        </blockquote>
                      )
                    }}
                  >
                    {currentPost.content}
                  </ReactMarkdown>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
                  {currentPost.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      liked
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                    {currentPost.likes + (liked ? 1 : 0)} Me gusta
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 mr-2">Compartir:</span>
                    <button
                      onClick={() => shareOnSocial('twitter')}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => shareOnSocial('facebook')}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => shareOnSocial('linkedin')}
                      className="p-2 text-gray-400 hover:text-blue-700 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <LinkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 md:p-8 mt-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6" />
                  Comentarios ({comments.length})
                </h3>
                <button
                  onClick={() => setShowCommentForm(!showCommentForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Añadir comentario
                </button>
              </div>

              {/* Comment Form */}
              {showCommentForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handleCommentSubmit}
                  className="mb-8 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Tu nombre *"
                      value={commentForm.author.name}
                      onChange={(e) => setCommentForm(prev => ({
                        ...prev,
                        author: { ...prev.author, name: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Tu email"
                      value={commentForm.author.email}
                      onChange={(e) => setCommentForm(prev => ({
                        ...prev,
                        author: { ...prev.author, email: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <textarea
                    placeholder="Escribe tu comentario... *"
                    value={commentForm.content}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Publicar comentario
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCommentForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex gap-4"
                  >
                    <Image
                      src={comment.author.avatar || '/default-avatar.png'}
                      alt={comment.author.name}
                      width={40}
                      height={40}
                      className="rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {comment.author.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                          {comment.status === 'pending' && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Pendiente de moderación
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-3">{comment.content}</p>
                        <button
                          onClick={() => handleCommentLike(comment.id)}
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {comment.likes} útil
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {comments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Sé el primero en comentar este artículo.</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Author Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="text-center">
                  <Image
                    src={currentPost.author.avatar || '/default-avatar.png'}
                    alt={currentPost.author.name}
                    width={80}
                    height={80}
                    className="rounded-full mx-auto mb-4"
                  />
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {currentPost.author.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {currentPost.author.bio}
                  </p>
                  {currentPost.author.socialLinks && (
                    <div className="flex justify-center gap-2">
                      {currentPost.author.socialLinks.twitter && (
                        <a
                          href={currentPost.author.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      {currentPost.author.socialLinks.linkedin && (
                        <a
                          href={currentPost.author.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-700 transition-colors"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    Artículos relacionados
                  </h4>
                  <div className="space-y-4">
                    {relatedPosts.map(post => (
                      <Link key={post.id} href={`/blog/${post.slug}`}>
                        <div className="flex gap-3 group cursor-pointer">
                          <div className="flex-shrink-0 w-16 h-16 relative rounded-lg overflow-hidden">
                            <Image
                              src={post.featuredImage || '/default-blog-image.jpg'}
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                              {post.title}
                            </h5>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {post.readingTime} min
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}