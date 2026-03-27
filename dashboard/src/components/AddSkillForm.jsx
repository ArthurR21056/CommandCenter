import { useState } from 'react';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export default function AddSkillForm({ onAdd, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [body, setBody] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    onAdd({
      name: name.trim(),
      description: description.trim(),
      method,
      url: url.trim(),
      headers: method !== 'GET' && body ? { 'Content-Type': 'application/json' } : {},
      body: body.trim(),
    });
  }

  return (
    <form className="add-skill-form" onSubmit={handleSubmit}>
      <h3>Add Skill</h3>
      <div className="form-row">
        <div className="form-group" style={{ flex: '0 0 100px' }}>
          <label>Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="form-select">
            {METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            required
          />
        </div>
      </div>
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Deploy Staging"
          autoFocus
          required
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this action do?"
        />
      </div>
      {method !== 'GET' && (
        <div className="form-group">
          <label>Body (JSON)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{"key": "value"}'
            className="form-textarea"
            rows={3}
          />
        </div>
      )}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Add Skill</button>
      </div>
    </form>
  );
}
