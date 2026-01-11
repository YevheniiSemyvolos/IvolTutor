// Рендеринг вмісту події
export default function EventContent({ event }) {
  return (
    <div style={{ padding: '4px 8px', overflow: 'hidden' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1em' }}>
        {event.title}
      </div>
      <div style={{ fontSize: '0.9em', opacity: 0.9 }}>
        {event.extendedProps.displayTime}
      </div>
    </div>
  );
}
