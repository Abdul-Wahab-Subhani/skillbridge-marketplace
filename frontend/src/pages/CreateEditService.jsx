import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'Graphic Design',
  'Content Writing', 'Digital Marketing', 'Video Editing',
  'UI/UX Design', 'SEO', 'Other',
];

const CreateEditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    price: '',
    deliveryTime: '',
    tags: '',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/services/${id}`).then(({ data }) => {
      const s = data.data.service;
      setForm({
        title: s.title,
        description: s.description,
        category: s.category,
        price: s.price,
        deliveryTime: s.deliveryTime,
        tags: s.tags?.join(', ') || '',
      });
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach((img) => formData.append('images', img));

      if (isEdit) {
        await api.put(`/services/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Service updated!');
        navigate(`/services/${id}`);
      } else {
        const { data } = await api.post('/services', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Service listed!');
        navigate(`/services/${data.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="py-16 text-center text-brand-400">Loading...</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-800 dark:text-white">
        {isEdit ? 'Edit Service' : 'Create New Service'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 card p-6 space-y-5">
        <div>
          <label className="label">Service Title</label>
          <input
            required
            maxLength={100}
            className="input"
            placeholder="e.g. I will build a React e-commerce website"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            required
            rows={5}
            maxLength={2000}
            className="input"
            placeholder="Describe exactly what you'll deliver..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <p className="mt-1 text-xs text-brand-400">{form.description.length}/2000</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Price (USD)</label>
            <input
              type="number"
              required
              min={0}
              className="input"
              placeholder="e.g. 150"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label">Delivery Time (days)</label>
          <input
            type="number"
            required
            min={1}
            className="input"
            placeholder="e.g. 7"
            value={form.deliveryTime}
            onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Tags (comma separated)</label>
          <input
            className="input"
            placeholder="react, website, responsive"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Images (up to 5)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="block w-full text-sm text-brand-500 file:mr-3 file:rounded-lg file:border-0 file:bg-accent-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent-600 hover:file:bg-accent-100 dark:file:bg-accent-500/10 dark:file:text-accent-300"
            onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-accent">
            {saving ? 'Saving...' : isEdit ? 'Update Service' : 'Publish Service'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEditService;
