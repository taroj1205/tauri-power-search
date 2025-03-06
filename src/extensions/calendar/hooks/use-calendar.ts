import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CalendarEvent {
  day: string;
  startTime: string;
  endTime: string;
  courseCode: string;
  roomNumber: string;
  location: string;
}

interface UseCalendarResult {
  events: CalendarEvent[];
  processTable: (html: string) => void;
  getIcsDownloadUrl: () => string;
  isLoading: boolean;
  error: Error | null;
}

export const useCalendar = (): UseCalendarResult => {
  const queryClient = useQueryClient();

  const dayNameToWeekday = (dayName: string): number => {
    const dayMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
    return dayMap[dayName];
  };

  const toICSFormat = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  };

  const generateICSContent = (events: CalendarEvent[]): string => {
    const timezoneDefinition = `BEGIN:VTIMEZONE\nTZID:Pacific/Auckland\nBEGIN:STANDARD\nDTSTART:20240407T030000\nTZOFFSETTO:+1200\nTZOFFSETFROM:+1300\nTZNAME:NZST\nEND:STANDARD\nBEGIN:DAYLIGHT\nDTSTART:20240929T020000\nTZOFFSETTO:+1300\nTZOFFSETFROM:+1200\nTZNAME:NZDT\nEND:DAYLIGHT\nEND:VTIMEZONE\n`;

    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//T3 Chat//NONSGML v1.0//EN\n${timezoneDefinition}`;

    events.forEach((event) => {
      const startDate = new Date();
      const dayOfWeek = dayNameToWeekday(event.day);

      let dayDiff = dayOfWeek - startDate.getDay();
      if (dayDiff < 0) {
        dayDiff += 7;
      }
      startDate.setDate(startDate.getDate() + dayDiff);

      const [startHours, startMinutes] = event.startTime
        .toUpperCase()
        .replace("AM", "")
        .replace("PM", "")
        .trim()
        .split(":")
        .map(Number);
      const [endHours, endMinutes] = event.endTime
        .toUpperCase()
        .replace("AM", "")
        .replace("PM", "")
        .trim()
        .split(":")
        .map(Number);

      const startAMPM = event.startTime.toUpperCase().includes("AM")
        ? "AM"
        : "PM";
      const endAMPM = event.endTime.toUpperCase().includes("AM") ? "AM" : "PM";

      let startHour = startHours;
      let endHour = endHours;

      if (startAMPM === "PM" && startHour !== 12) startHour += 12;
      if (endAMPM === "PM" && endHour !== 12) endHour += 12;
      if (startAMPM === "AM" && startHour === 12) startHour = 0;
      if (endAMPM === "AM" && endHour === 12) endHour = 0;

      startDate.setHours(startHour, startMinutes, 0);
      const endDate = new Date(startDate);
      endDate.setHours(endHour, endMinutes, 0);

      const startDateFormatted = toICSFormat(startDate);
      const endDateFormatted = toICSFormat(endDate);
      const untilDate = new Date("2025-06-06T23:59:59");
      const untilDateFormatted = toICSFormat(untilDate).substring(0, 8);

      icsContent += `BEGIN:VEVENT\n`;
      icsContent += `DTSTART;TZID=Pacific/Auckland:${startDateFormatted}\n`;
      icsContent += `DTEND;TZID=Pacific/Auckland:${endDateFormatted}\n`;
      icsContent += `SUMMARY:${event.courseCode}\n`;
      icsContent += `LOCATION:${event.location}, ${event.roomNumber}\n`;
      icsContent += `DESCRIPTION:Course: ${event.courseCode}\\nLocation: ${event.location}, Room: ${event.roomNumber}\n`;
      icsContent += `RRULE:FREQ=WEEKLY;UNTIL=${untilDateFormatted};TZID=Pacific/Auckland\n`;
      icsContent += `END:VEVENT\n`;
    });

    icsContent += `END:VCALENDAR\n`;
    return icsContent;
  };

  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: () => [],
    initialData: [],
  });

  const mutation = useMutation({
    mutationFn: async (html: string) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const table = doc.getElementById("WEEKLY_SCHED_HTMLAREA");
      if (!table) return [];

      const days: string[] = [];
      const extractedEvents: CalendarEvent[] = [];

      const headerRow = table.querySelector("tr");
      if (!headerRow) return [];

      const dayHeaders = Array.from(headerRow.querySelectorAll("th")).slice(1);
      dayHeaders.forEach((header) => {
        const dayName = header.textContent?.split("\n")[0].trim() || "";
        days.push(dayName);
      });

      const timeSlots = Array.from(
        table.querySelectorAll("td.uoa_gridheader_cal[rowspan] span"),
      ).map((span) => span.textContent?.trim() || "");

      for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
        const day = days[dayIndex];
        const currentCellIndex = dayIndex + 1;

        timeSlots.forEach((_, timeSlotIndex) => {
          const row = 2 * timeSlotIndex + 1;
          const cell = table.querySelector(
            `tr:nth-child(${row + 1}) > td:nth-child(${currentCellIndex + 1})`,
          );

          if (cell?.classList.contains("uoa_cal_ENRL_stat")) {
            const eventLink = cell.querySelector("a");
            if (eventLink) {
              const eventDetails = eventLink.innerHTML
                .split("<br>")
                .map((item) => item.trim());
              const [timeRange, courseCode, roomNumber, location] =
                eventDetails;
              const [startTime, endTime] = timeRange.split(" - ");

              extractedEvents.push({
                day,
                startTime,
                endTime,
                courseCode,
                roomNumber,
                location,
              });
            }
          }
        });
      }

      return extractedEvents;
    },
    onSuccess: (newEvents) => {
      queryClient.setQueryData(["calendar-events"], newEvents);
    },
  });

  const processTable = (html: string) => {
    mutation.mutate(html);
  };

  const getIcsDownloadUrl = (): string => {
    const icsContent = generateICSContent(events);
    const blob = new Blob([icsContent], { type: "text/calendar" });
    return URL.createObjectURL(blob);
  };

  return {
    events,
    processTable,
    getIcsDownloadUrl,
    isLoading,
    error,
  };
};
