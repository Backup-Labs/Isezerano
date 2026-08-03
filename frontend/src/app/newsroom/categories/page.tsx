"use client";
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Plus, Edit3, Trash2, ChevronUp, ChevronDown, 
  CheckCircle, Layers, FolderHeart, Info
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  color_accent: string;
  parent: number | null;
  order: number;
}

export default function CategoriesManager() {
  const { token } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  // Modal controls
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formColorAccent, setFormColorAccent] = useState('#2F6DF6');
  const [formParent, setFormParent] = useState<string>('');
  const [formOrder, setFormOrder] = useState(0);

  const fetchCategories = async () => {
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/cms/categories/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Sort by order, then parent, then name
        setCategories(data.sort((a: Category, b: Category) => a.order - b.order));
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCategories();
  }, [token]);

  // Helper to auto-generate slug
  useEffect(() => {
    if (formName && !editingCategory) {
      setFormSlug(
        formName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  }, [formName]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/cms/categories/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: formName,
          slug: formSlug,
          color_accent: formColorAccent,
          parent: Number(formParent) || null,
          order: Number(formOrder) || 0
        })
      });
      if (res.ok) {
        setShowCreateModal(false);
        setFormName(''); setFormSlug(''); setFormColorAccent('#2F6DF6'); setFormParent(''); setFormOrder(0);
        showToast("Category created successfully!");
        fetchCategories();
      } else {
        alert("Failed to create category. Ensure slug is unique.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/categories/${editingCategory.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: formName,
          slug: formSlug,
          color_accent: formColorAccent,
          parent: Number(formParent) || null,
          order: Number(formOrder) || 0
        })
      });
      if (res.ok) {
        setShowEditModal(false);
        setEditingCategory(null);
        showToast("Category updated successfully!");
        fetchCategories();
      } else {
        alert("Failed to update category.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category? Articles in this category will be unassigned.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cms/categories/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Category deleted successfully.");
        fetchCategories();
      } else {
        alert("Failed to delete category.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorder = async (category: Category, direction: 'up' | 'down') => {
    const idx = categories.findIndex(c => c.id === category.id);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;
    
    const target = categories[targetIdx];
    try {
      // Swap order values
      await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/cms/categories/${category.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ order: target.order })
        }),
        fetch(`${API_BASE_URL}/api/v1/cms/categories/${target.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ order: category.order })
        })
      ]);
      fetchCategories();
      showToast("Order updated.");
    } catch (e) {
      console.error(e);
    }
  };

  const openCreateModal = () => {
    setFormName('');
    setFormSlug('');
    setFormColorAccent('#2F6DF6');
    setFormParent('');
    setFormOrder(categories.length);
    setShowCreateModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormColorAccent(cat.color_accent || '#2F6DF6');
    setFormParent(cat.parent?.toString() || '');
    setFormOrder(cat.order);
    setShowEditModal(true);
  };

  const showToast = (msg: string) => {
    setMessage(msg);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const getParentName = (parentId: number | null) => {
    if (!parentId) return '-';
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : '-';
  };

  const inputCls = "bg-white border border-theme-gray-100 px-4 py-2 text-xs text-theme-black focus:outline-none focus:border-theme-blue w-full rounded";
  const labelCls = "text-[10px] font-mono text-theme-gray-400 uppercase font-bold tracking-wider";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh]">
        <div className="w-8 h-8 border-t-2 border-theme-blue rounded-full animate-spin mb-2" />
        <span className="font-mono text-xs text-theme-gray-400">LOADING CATEGORIES...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-theme-black animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-gray-100">
        <div className="flex flex-col gap-1">
          <h1 className="serif-title text-2xl font-bold uppercase tracking-wider text-theme-black flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-theme-blue" />
            Category Management
          </h1>
          <p className="text-xs text-theme-gray-400 font-mono">
            Organize article directories, configure navigation hierarchy, and select tag color accents
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase tracking-wider transition-all self-start sm:self-center cursor-pointer rounded"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Toast Alert */}
      {success && (
        <div className="p-4 border border-green-600 bg-green-50 text-green-700 text-xs font-mono flex items-center gap-2 rounded shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Table */}
      <div className="border border-theme-gray-100 overflow-hidden rounded shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme-gray-100 text-[10px] font-mono text-theme-gray-400 uppercase bg-theme-light-gray">
                <th className="p-4 pl-6">Category Name</th>
                <th className="p-4">Slug Identifier</th>
                <th className="p-4">Parent Category</th>
                <th className="p-4">Color Accent</th>
                <th className="p-4">Display Order</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-gray-100 text-sm text-theme-black font-mono bg-white">
              {categories.map((cat, idx) => (
                <tr key={cat.id} className="hover:bg-theme-light-gray/40 transition-colors">
                  <td className="p-4 pl-6 font-bold text-theme-black flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full border border-black/10 shrink-0" 
                      style={{ backgroundColor: cat.color_accent }} 
                    />
                    {cat.name}
                  </td>
                  <td className="p-4 text-xs font-semibold text-theme-gray-400">/{cat.slug}</td>
                  <td className="p-4 text-xs text-theme-black">
                    {cat.parent ? (
                      <span className="px-2 py-0.5 bg-theme-light-gray border border-theme-gray-100 rounded text-[10px]">
                        {getParentName(cat.parent)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-theme-gray-400 italic">None (Root)</span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-theme-black">
                    <code className="px-1.5 py-0.5 bg-theme-light-gray border border-theme-gray-100 rounded">{cat.color_accent}</code>
                  </td>
                  <td className="p-4 text-xs text-theme-black font-bold">{cat.order}</td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleReorder(cat, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 border border-theme-gray-100 hover:bg-theme-light-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-theme-black rounded"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleReorder(cat, 'down')}
                        disabled={idx === categories.length - 1}
                        className="p-1.5 border border-theme-gray-100 hover:bg-theme-light-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-theme-black rounded"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 border border-theme-gray-100 hover:bg-theme-light-gray hover:text-theme-blue transition-all cursor-pointer text-theme-black rounded"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 border border-theme-gray-100 hover:bg-red-50 hover:text-red-700 hover:border-red-500 transition-all cursor-pointer text-theme-black rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-xs uppercase tracking-wider text-theme-gray-400">
                    No categories registered. Click "Add Category" to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 border border-theme-blue/20 bg-theme-light-gray text-theme-black text-xs rounded font-mono flex gap-2">
        <Info className="w-5 h-5 text-theme-blue shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Category structures and ordering changes update dynamically. These modifications will immediately refresh the category dropdown inside both the write/edit panels and the public side navigation bar.
        </p>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="border border-theme-gray-100 bg-white text-theme-black w-full max-w-md p-6 flex flex-col gap-5 shadow-xl max-h-[90vh] overflow-y-auto rounded">
            <div className="flex justify-between items-center pb-3 border-b border-theme-gray-100">
              <h3 className="serif-title text-base font-bold text-theme-black uppercase flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-theme-blue" />
                Add New Category
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-theme-gray-400 hover:text-theme-black cursor-pointer font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technology"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Slug Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. technology"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Color Accent</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formColorAccent}
                      onChange={(e) => setFormColorAccent(e.target.value)}
                      className="w-10 h-8 rounded border border-theme-gray-100 cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      value={formColorAccent}
                      onChange={(e) => setFormColorAccent(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Display Order Weight</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Parent Category (Optional)</label>
                <select
                  value={formParent}
                  onChange={(e) => setFormParent(e.target.value)}
                  className={inputCls}
                >
                  <option value="">-- None (Make Root Category) --</option>
                  {categories.filter(c => !c.parent).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-theme-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-theme-gray-100 text-xs font-mono font-bold uppercase rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase rounded cursor-pointer"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="border border-theme-gray-100 bg-white text-theme-black w-full max-w-md p-6 flex flex-col gap-5 shadow-xl max-h-[90vh] overflow-y-auto rounded">
            <div className="flex justify-between items-center pb-3 border-b border-theme-gray-100">
              <h3 className="serif-title text-base font-bold text-theme-black uppercase flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-theme-blue" />
                Configure Category
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCategory(null);
                }}
                className="text-theme-gray-400 hover:text-theme-black cursor-pointer font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Category Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Slug Identifier</label>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Color Accent</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formColorAccent}
                      onChange={(e) => setFormColorAccent(e.target.value)}
                      className="w-10 h-8 rounded border border-theme-gray-100 cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      value={formColorAccent}
                      onChange={(e) => setFormColorAccent(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Display Order Weight</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Parent Category (Optional)</label>
                <select
                  value={formParent}
                  onChange={(e) => setFormParent(e.target.value)}
                  className={inputCls}
                >
                  <option value="">-- None (Make Root Category) --</option>
                  {categories.filter(c => !c.parent && c.id !== editingCategory.id).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-theme-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 border border-theme-gray-100 text-xs font-mono font-bold uppercase rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-theme-blue hover:bg-theme-blue-glow text-white text-xs font-mono font-bold uppercase rounded cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
