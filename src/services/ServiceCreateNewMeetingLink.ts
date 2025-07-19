// Dummy meeting link generator
export const ServiceCreateNewMeetingLink = (): string => {
  return `https://meeting.example.com/${Math.random().toString(36).substring(2, 10)}`;
};