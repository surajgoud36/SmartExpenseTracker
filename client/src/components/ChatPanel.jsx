export default function ChatPanel() {
  return (
    <div className="panel chat-panel">
      <h3>AI insights</h3>
      <div className="chat-placeholder">
        <p className="muted">
          Ask questions about your spending — coming in Phase 4.
        </p>
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          placeholder="e.g. Why did I spend more this month?"
          disabled
        />
        <button className="btn-primary" disabled>
          Send
        </button>
      </div>
    </div>
  );
}
