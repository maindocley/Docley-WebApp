import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { ArrowLeft, Save, Loader2, Send, Image as ImageIcon, Tag, Link2, Hash } from 'lucide-react';
import { getBlogPosts, createBlogPost, updateBlogPost } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

export default function BlogPostEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isLoading, setIsLoading] = useState(!!id);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        tags: '',
        published: false,
        cover_image: '',
    });

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({ openOnClick: false }),
            Placeholder.configure({
                placeholder: 'Start writing your post content here...',
            }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px]',
            },
        },
    });

    useEffect(() => {
        if (id) {
            loadPost();
        }
    }, [id]);

    const loadPost = async () => {
        try {
            const posts = await getBlogPosts();
            const post = posts.find(p => p.id === id);

            if (post) {
                setFormData({
                    title: post.title,
                    slug: post.slug,
                    tags: post.tags || '',
                    published: post.published,
                    cover_image: post.cover_image || '',
                });
                editor?.commands.setContent(post.content || '');
            } else {
                addToast('Post not found', 'error');
                navigate('/admin/blog');
            }
        } catch (error) {
            console.error('Error loading post:', error);
            addToast('Failed to load post', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (publish = false) => {
        if (!formData.title) {
            addToast('Title is required', 'error');
            return;
        }

        if (publish) {
            setIsPublishing(true);
        } else {
            setIsSaving(true);
        }

        try {
            const postData = {
                ...formData,
                content: editor.getHTML(),
                published: publish ? true : formData.published,
                updated_at: new Date().toISOString(),
            };

            if (id) {
                await updateBlogPost(id, postData);
                addToast(publish ? 'Post published!' : 'Draft saved', 'success');
            } else {
                await createBlogPost(postData);
                addToast(publish ? 'Post published!' : 'Draft created', 'success');
                navigate('/admin/blog');
            }
        } catch (error) {
            console.error('Error saving post:', error);
            addToast('Failed to save post', 'error');
        } finally {
            setIsSaving(false);
            setIsPublishing(false);
        }
    };

    const generateSlug = () => {
        const slug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        setFormData({ ...formData, slug });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 -m-4 md:-m-8">
            {/* Clean White Header */}
            <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/admin/blog')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors active:scale-95"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">Back</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSave(false)}
                            disabled={isSaving || isPublishing}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Save Draft
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={isSaving || isPublishing}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors active:scale-95 disabled:opacity-50 shadow-lg shadow-orange-500/25"
                        >
                            {isPublishing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            Publish
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                <div className="flex gap-8">
                    {/* Center Column - Editor */}
                    <div className="flex-1 max-w-4xl">
                        {/* Featured Image Preview */}
                        {formData.cover_image && (
                            <div className="mb-6 aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                <img
                                    src={formData.cover_image}
                                    alt="Cover"
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </div>
                        )}

                        {/* Title Input - Large and Borderless */}
                        <input
                            type="text"
                            placeholder="Post title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            onBlur={() => !formData.slug && generateSlug()}
                            className="w-full text-4xl font-bold text-slate-900 placeholder-slate-300 border-none bg-transparent focus:outline-none focus:ring-0 mb-6"
                        />

                        {/* Editor - White Background */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 min-h-[500px]">
                            <EditorContent editor={editor} />
                        </div>
                    </div>

                    {/* Right Sidebar - Settings */}
                    <div className="w-80 flex-shrink-0 hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            {/* Slug */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Link2 className="h-4 w-4 text-slate-400" />
                                    <h3 className="font-semibold text-slate-900 text-sm">URL Slug</h3>
                                </div>
                                <input
                                    type="text"
                                    placeholder="my-post-url"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                />
                                <button
                                    onClick={generateSlug}
                                    className="mt-2 text-xs text-orange-600 hover:text-orange-700 font-medium"
                                >
                                    Generate from title
                                </button>
                            </div>

                            {/* Tags */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Tag className="h-4 w-4 text-slate-400" />
                                    <h3 className="font-semibold text-slate-900 text-sm">Tags</h3>
                                </div>
                                <input
                                    type="text"
                                    placeholder="ai, writing, tips"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                />
                                <p className="mt-2 text-xs text-slate-400">Separate with commas</p>
                            </div>

                            {/* Featured Image */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <ImageIcon className="h-4 w-4 text-slate-400" />
                                    <h3 className="font-semibold text-slate-900 text-sm">Featured Image</h3>
                                </div>
                                <input
                                    type="text"
                                    placeholder="https://example.com/image.jpg"
                                    value={formData.cover_image}
                                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                />
                                {formData.cover_image && (
                                    <div className="mt-3 aspect-video w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-100">
                                        <img
                                            src={formData.cover_image}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Hash className="h-4 w-4 text-slate-400" />
                                    <h3 className="font-semibold text-slate-900 text-sm">Status</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${formData.published ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                    <span className="text-sm text-slate-600">
                                        {formData.published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
