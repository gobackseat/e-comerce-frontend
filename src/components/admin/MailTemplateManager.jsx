import React, { useEffect, useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-hot-toast';
import { config } from '../../utils/config';

const defaultSampleData = {
  userName: 'Jane Doe',
  orderId: '123456',
  resetLink: 'https://example.com/reset',
};

export default function MailTemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', subject: '', body: '', variables: [] });
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const quillRef = useRef();

  // Fetch templates
  useEffect(() => {
    setLoading(true);
    fetch(`${config.baseURL}/admin/mail-templates?page=${pagination.page}&limit=${pagination.limit}`)
      .then(res => res.json())
      .then(data => {
        setTemplates(data.templates || []);
        setPagination(p => ({ ...p, total: data.pagination?.total || 0 }));
      })
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, [pagination.page, pagination.limit]);

  // Search filter
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  // Handle create/edit
  const handleEdit = (tpl) => {
    setSelected(tpl);
    setForm({ ...tpl });
    setEditMode(true);
  };
  const handleNew = () => {
    setSelected(null);
    setForm({ name: '', type: '', subject: '', body: '', variables: [] });
    setEditMode(true);
  };
  const handleDelete = async (tpl) => {
    if (!window.confirm('Delete this template?')) return;
    await fetch(`${config.baseURL}/admin/mail-templates/${tpl._id}`, { method: 'DELETE' });
    setTemplates(templates.filter(t => t._id !== tpl._id));
    toast.success('Template deleted');
  };
  const handleDuplicate = (tpl) => {
    setForm({ ...tpl, name: tpl.name + ' Copy', _id: undefined });
    setEditMode(true);
  };
  const handleSave = async () => {
    if (!form.name || !form.type || !form.subject || !form.body) {
      toast.error('All fields are required');
      return;
    }
    const method = form._id ? 'PUT' : 'POST';
    const url = form._id ? `${config.baseURL}/admin/mail-templates/${form._id}` : `${config.baseURL}/admin/mail-templates`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok && data.template) {
      toast.success('Template saved');
      setEditMode(false);
      setSelected(data.template);
      setTemplates(tpls => {
        const idx = tpls.findIndex(t => t._id === data.template._id);
        if (idx >= 0) {
          const arr = [...tpls];
          arr[idx] = data.template;
          return arr;
        }
        return [data.template, ...tpls];
      });
    } else {
      toast.error(data.error || 'Failed to save template');
    }
  };

  // Preview
  const handlePreview = async () => {
    setPreviewLoading(true);
    setPreviewHtml('');
    const res = await fetch(`${config.baseURL}/admin/mail-templates/${form._id}/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: defaultSampleData }),
    });
    const data = await res.json();
    setPreviewHtml(data.html || '');
    setPreviewLoading(false);
  };

  // Test send
  const handleTestSend = async () => {
    if (!testEmail) return toast.error('Enter a test email address');
    setTestSending(true);
    const res = await fetch(`${config.baseURL}/admin/mail-templates/${form._id}/send-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: testEmail, data: defaultSampleData }),
    });
    const data = await res.json();
    if (res.ok) toast.success('Test email sent');
    else toast.error(data.error || 'Failed to send test email');
    setTestSending(false);
  };

  // Insert variable
  const insertVariable = (variable) => {
    const quill = quillRef.current.getEditor();
    const cursor = quill.getSelection()?.index || quill.getLength();
    quill.insertText(cursor, `{{${variable}}}`);
    quill.setSelection(cursor + variable.length + 4);
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Mail Templates</h2>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg" onClick={handleNew}>+ New Template</button>
      </div>
      <input
        type="text"
        placeholder="Search templates..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="px-4 py-2 border rounded w-full mb-4"
      />
      {loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
        <table className="min-w-full text-sm border rounded-lg mb-8">
          <thead className="bg-orange-100">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Subject</th>
              <th className="px-4 py-2 text-left">Version</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8">No templates found.</td></tr>
            ) : filteredTemplates.map(tpl => (
              <tr key={tpl._id} className="border-b hover:bg-orange-50">
                <td className="px-4 py-2">{tpl.name}</td>
                <td className="px-4 py-2">{tpl.type}</td>
                <td className="px-4 py-2">{tpl.subject}</td>
                <td className="px-4 py-2">{tpl.version}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button className="text-blue-600 underline" onClick={() => handleEdit(tpl)}>Edit</button>
                  <button className="text-gray-600 underline" onClick={() => handleDuplicate(tpl)}>Duplicate</button>
                  <button className="text-red-600 underline" onClick={() => handleDelete(tpl)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Edit/Create Panel */}
      {editMode && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold mb-4">{form._id ? 'Edit' : 'New'} Template</h3>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Name</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Type</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Subject</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Body (HTML)</label>
            <ReactQuill
              ref={quillRef}
              value={form.body}
              onChange={val => setForm(f => ({ ...f, body: val }))}
              modules={{ toolbar: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
              ] }}
              className="mb-2"
            />
            <div className="flex gap-2 mt-2">
              {['userName', 'orderId', 'resetLink'].map(v => (
                <button key={v} className="px-2 py-1 bg-gray-200 rounded text-xs" type="button" onClick={() => insertVariable(v)}>
                  Insert {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg" onClick={handleSave}>Save</button>
            <button className="bg-gray-300 px-4 py-2 rounded-lg" onClick={() => setEditMode(false)}>Cancel</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={handlePreview}>Preview</button>
            <input type="email" placeholder="Test email" className="border rounded px-2 py-1" value={testEmail} onChange={e => setTestEmail(e.target.value)} />
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg" onClick={handleTestSend} disabled={testSending}>{testSending ? 'Sending...' : 'Send Test'}</button>
          </div>
          {previewLoading ? <div className="mt-4">Loading preview...</div> : previewHtml && (
            <div className="mt-6 border rounded p-4 bg-gray-50">
              <div className="font-semibold mb-2">Preview:</div>
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 