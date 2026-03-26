import { useState } from 'react';

export default function AddSkillForm({ onAdd, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), description: description.trim() });
    setName('');
    setDescription('');
  }

  return (
    <form className="add-skill-form" onSubmit={handleSubmit}>
      <h3>Add New Skill</h3>
      <div className="form-group">
        <label htmlFor="skill-name">Name</label>
        <input
          id="skill-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Daily Review"
          autoFocus
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="skill-desc">Description</label>
        <input
          id="skill-desc"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description of the task"
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Add Skill
        </button>
      </div>
    </form>
  );
}
