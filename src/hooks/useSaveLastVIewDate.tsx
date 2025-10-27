import { format, isSameDay } from "date-fns";

const useSaveLastViewDate = () => {
  const today: string = format(new Date(), "yyyy-MM-dd");
  let lastDate: string | null = localStorage.getItem("lastDate");
  if (!lastDate) {
    localStorage.setItem("lastDate", "0000-00-00");
  }
  if (lastDate) {
    if (!isSameDay(today, lastDate)) {
      localStorage.setItem("lastDate", today);
      lastDate = today;
    }
  }
};

export default useSaveLastViewDate;
