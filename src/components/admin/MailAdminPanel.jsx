import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';

const TEMPLATES = [
  { value: '', label: 'Custom HTML/Plain' },
  { value: 'welcome', label: 'Welcome Email' },
  { value: 'order-confirmation', label: 'Order Confirmation' },
  { value: 'password-reset', label: 'Password Reset' },
];

export default function MailAdminPanel() {
  const token = useSelector((state) => state.auth.token);
  // User list state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userPages, setUserPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);

  // Email log state
  const [emails, setEmails] = useState([]);
  const [emailPage, setEmailPage] = useState(1);
  const [emailPages, setEmailPages] = useState(1);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSearch, setEmailSearch] = useState('');
  const [emailFilter, setEmailFilter] = useState({ status: '', template: '' });

  // Compose modal state
  const [showCompose, setShowCompose] = useState(false);
  const [composeForm, setComposeForm] = useState({
    to: [],
    subject: '',
    template: '',
    data: '{}',
    html: '',
    text: '',
  });
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState(null);

  // Templates
  const [templates, setTemplates] = useState([]);
  const [templateLoading, setTemplateLoading] = useState(false);

  // User email history
  const [showUserHistory, setShowUserHistory] = useState(false);
  const [userHistory, setUserHistory] = useState([]);
  const [userHistoryUser, setUserHistoryUser] = useState(null);
  const [userHistoryLoading, setUserHistoryLoading] = useState(false);

  // Fetch users
  useEffect(() => {
    setUserLoading(true);
    fetch(`/api/admin/users?search=${encodeURIComponent(userSearch)}&page=${userPage}`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setUserPages(data.pagination?.totalPages || 1);
      })
      .catch(() => setUsers([]))
      .finally(() => setUserLoading(false));
  }, [userSearch, userPage, token]);

  // Fetch email logs
  useEffect(() => {
    setEmailLoading(true);
    const params = new URLSearchParams({
      search: emailSearch,
      status: emailFilter.status,
      template: emailFilter.template,
      page: emailPage,
    });
    fetch(`/api/admin/mails?${params.toString()}`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setEmails(data.emails || []);
        setEmailPages(data.pages || 1);
      })
      .catch(() => setEmails([]))
      .finally(() => setEmailLoading(false));
  }, [emailSearch, emailFilter, emailPage, token]);

  // Fetch templates
  useEffect(() => {
    setTemplateLoading(true);
    fetch('/api/admin/email-templates', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []))
      .catch(() => setTemplates([]))
      .finally(() => setTemplateLoading(false));
  }, [token]);

  // Fetch user email history
  const openUserHistory = (user) => {
    setShowUserHistory(true);
    setUserHistoryUser(user);
    setUserHistoryLoading(true);
    fetch(`/api/admin/users/${user._id}/emails`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => setUserHistory(data.emails || []))
      .catch(() => setUserHistory([]))
      .finally(() => setUserHistoryLoading(false));
  };

  // Compose/send email
  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setSendResults(null);
    try {
      const payload = {
        ...composeForm,
        to: selectedUsers.map(u => u.email),
        data: composeForm.template ? JSON.parse(composeForm.data || '{}') : undefined,
      };
      const res = await fetch('/api/admin/mails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      setSendResults(result.results || []);
      toast.success(`Sent to ${result.successCount} users, ${result.failCount} failed.`);
      setShowCompose(false);
    } catch (err) {
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  // UI helpers
  const toggleUser = (user) => {
    setSelectedUsers((prev) =>
      prev.some(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    );
  };
  const allSelected = useMemo(() => users.length > 0 && selectedUsers.length === users.length, [users, selectedUsers]);
  const toggleAllUsers = () => {
    if (allSelected) setSelectedUsers([]);
    else setSelectedUsers(users);
  };

  if (!token || token === 'null' || token === 'undefined') {
    return <div className="p-8 text-center text-red-600 font-bold">You must be logged in as an admin to access the email dashboard.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Toaster position="top-center" />
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <span role="img" aria-label="mail">📧</span> Email & Newsletter Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User List Panel */}
        <motion.div layout className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Users</h3>
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="px-3 py-2 border rounded w-48"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded-lg">
              <thead className="bg-orange-100">
                <tr>
                  <th><input type="checkbox" checked={allSelected} onChange={toggleAllUsers} /></th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>History</th>
                </tr>
              </thead>
              <tbody>
                {userLoading ? (
                  <tr><td colSpan={6} className="text-center py-8">Loading users...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8">No users found.</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-orange-50">
                      <td><input type="checkbox" checked={selectedUsers.some(u => u._id === user._id)} onChange={() => toggleUser(user)} /></td>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                      <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                      <td><button className="text-blue-600 underline" onClick={() => openUserHistory(user)}>View</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button disabled={userPage <= 1} onClick={() => setUserPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50">Prev</button>
            <span>Page {userPage} of {userPages}</span>
            <button disabled={userPage >= userPages} onClick={() => setUserPage(p => Math.min(p + 1, userPages))} className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50">Next</button>
          </div>
          <button
            className="mt-6 w-full py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-semibold text-lg transition-colors"
            onClick={() => setShowCompose(true)}
            disabled={selectedUsers.length === 0}
          >
            Compose Email to Selected
          </button>
        </motion.div>

        {/* Email Log Panel */}
        <motion.div layout className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Email Log</h3>
            <input
              type="text"
              placeholder="Search emails..."
              value={emailSearch}
              onChange={e => setEmailSearch(e.target.value)}
              className="px-3 py-2 border rounded w-48"
            />
          </div>
          <div className="flex gap-2 mb-4">
            <select value={emailFilter.status} onChange={e => setEmailFilter(f => ({ ...f, status: e.target.value }))} className="px-2 py-1 border rounded">
              <option value="">All Status</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
            <select value={emailFilter.template} onChange={e => setEmailFilter(f => ({ ...f, template: e.target.value }))} className="px-2 py-1 border rounded">
              <option value="">All Templates</option>
              {templates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded-lg">
              <thead className="bg-orange-100">
                <tr>
                  <th>To</th>
                  <th>Subject</th>
                  <th>Template</th>
                  <th>Status</th>
                  <th>Sent At</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {emailLoading ? (
                  <tr><td colSpan={6} className="text-center py-8">Loading emails...</td></tr>
                ) : emails.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8">No emails found.</td></tr>
                ) : (
                  emails.map(email => (
                    <tr key={email._id} className="border-b hover:bg-orange-50">
                      <td>{email.to}</td>
                      <td>{email.subject}</td>
                      <td>{email.template || '-'}</td>
                      <td className={email.status === 'sent' ? 'text-green-600' : email.status === 'failed' ? 'text-red-600' : 'text-gray-600'}>{email.status}</td>
                      <td>{new Date(email.sentAt).toLocaleString()}</td>
                      <td className="text-xs text-red-600">{email.error || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button disabled={emailPage <= 1} onClick={() => setEmailPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50">Prev</button>
            <span>Page {emailPage} of {emailPages}</span>
            <button disabled={emailPage >= emailPages} onClick={() => setEmailPage(p => Math.min(p + 1, emailPages))} className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50">Next</button>
          </div>
        </motion.div>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            onClick={() => setShowCompose(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Compose Email</h3>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
                  <label className="block font-medium mb-1">To</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(u => (
                      <span key={u._id} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">{u.email}</span>
                    ))}
                  </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Subject</label>
                  <input type="text" required className="w-full p-2 rounded border" value={composeForm.subject} onChange={e => setComposeForm(f => ({ ...f, subject: e.target.value }))} />
          </div>
          <div>
            <label className="block font-medium mb-1">Template</label>
                  <select className="w-full p-2 rounded border" value={composeForm.template} onChange={e => setComposeForm(f => ({ ...f, template: e.target.value }))}>
                    <option value="">Custom HTML/Plain</option>
                    {templates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
            </select>
          </div>
                {composeForm.template && (
            <div>
              <label className="block font-medium mb-1">Template Data (JSON)</label>
                    <textarea className="w-full p-2 rounded border" rows={3} value={composeForm.data} onChange={e => setComposeForm(f => ({ ...f, data: e.target.value }))} placeholder='{"firstName":"John","orderId":"123"}' />
            </div>
          )}
                {!composeForm.template && (
            <>
              <div>
                <label className="block font-medium mb-1">HTML Content</label>
                      <textarea className="w-full p-2 rounded border" rows={4} value={composeForm.html} onChange={e => setComposeForm(f => ({ ...f, html: e.target.value }))} />
              </div>
              <div>
                <label className="block font-medium mb-1">Plain Text (optional)</label>
                      <textarea className="w-full p-2 rounded border" rows={2} value={composeForm.text} onChange={e => setComposeForm(f => ({ ...f, text: e.target.value }))} />
              </div>
            </>
          )}
                <div className="flex gap-2 mt-4">
          <button type="submit" className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700" disabled={sending}>{sending ? 'Sending...' : 'Send Email'}</button>
                  <button type="button" className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" onClick={() => setShowCompose(false)}>Cancel</button>
                </div>
                {sendResults && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Send Results</h4>
                    <ul className="text-sm">
                      {sendResults.map(r => (
                        <li key={r.to} className={r.success ? 'text-green-700' : 'text-red-700'}>
                          {r.to}: {r.success ? 'Sent' : `Failed (${r.error})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
        </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Email History Modal */}
      <AnimatePresence>
        {showUserHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            onClick={() => setShowUserHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Email History for {userHistoryUser?.email}</h3>
              {userHistoryLoading ? (
                <div>Loading...</div>
              ) : userHistory.length === 0 ? (
                <div>No emails found for this user.</div>
              ) : (
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full text-sm border rounded-lg">
                    <thead className="bg-orange-100">
                      <tr>
                        <th>Subject</th>
                        <th>Template</th>
                        <th>Status</th>
                        <th>Sent At</th>
                        <th>Error</th>
              </tr>
            </thead>
            <tbody>
                      {userHistory.map(email => (
                        <tr key={email._id} className="border-b hover:bg-orange-50">
                          <td>{email.subject}</td>
                          <td>{email.template || '-'}</td>
                          <td className={email.status === 'sent' ? 'text-green-600' : email.status === 'failed' ? 'text-red-600' : 'text-gray-600'}>{email.status}</td>
                          <td>{new Date(email.sentAt).toLocaleString()}</td>
                          <td className="text-xs text-red-600">{email.error || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
              <button className="mt-6 px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" onClick={() => setShowUserHistory(false)}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 