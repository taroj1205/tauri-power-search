import { Button, Center, Textarea, VStack } from "@yamada-ui/react";
import { memo, useCallback } from "react";
import { useCalendar } from "./hooks/use-calendar";

export const CalendarExtension = memo(() => {
  const { events, processTable, getIcsDownloadUrl, isLoading } = useCalendar();

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      processTable(e.target.value);
    },
    [processTable],
  );

  return (
    <Center as={VStack} gap="md" h="full">
      <Textarea placeholder="Paste the html here" onChange={handleTextChange} />
      <Button
        as="a"
        href={getIcsDownloadUrl()}
        download="timetable.ics"
        disabled={isLoading || !events.length}
      >
        Download ICS
      </Button>
    </Center>
  );
});

CalendarExtension.displayName = "CalendarExtension";
