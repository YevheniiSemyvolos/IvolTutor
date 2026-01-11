// Обгортка FullCalendar з налаштуваннями
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function renderEventContent(eventInfo) {
  const { displayTime } = eventInfo.event.extendedProps;
  return (
    <div className="fc-event-main-frame">
      <div className="fc-event-time">{displayTime}</div>
      <div className="fc-event-title-container">
        <div className="fc-event-title fc-sticky">{eventInfo.event.title}</div>
      </div>
    </div>
  );
}

export default function CalendarView({
  calendarRef,
  eventsSource,
  onDateSelect,
  onEventClick,
  onEventDrop,
  onEventResize
}) {
  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }}
      locale="uk"
      firstDay={1}
      views={{
        dayGridMonth: {
          dayHeaderFormat: { weekday: 'short' }
        },
        timeGridWeek: {
          dayHeaderFormat: { weekday: 'short', day: 'numeric', omitCommas: true }
        },
        timeGridDay: {
          dayHeaderFormat: { weekday: 'short', day: 'numeric', omitCommas: true }
        }
      }}
      slotMinTime="10:00:00"
      slotMaxTime="22:00:00"
      allDaySlot={false}
      nowIndicator
      events={eventsSource}
      eventContent={renderEventContent}
      selectable
      selectMirror
      select={onDateSelect}
      editable
      eventClick={onEventClick}
      eventDrop={onEventDrop}
      eventResize={onEventResize}
      expandRows
      height="90vh"
    />
  );
}
