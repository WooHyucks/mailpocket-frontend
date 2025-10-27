import { useEffect, useState, MutableRefObject, RefObject } from "react";

const useScrollController = (ref: any) => {
  const [isResult, setIsResult] = useState(false);

  useEffect(() => {
    const main = ref.current;

    if (!main) {
      return;
    }

    const handleScroll = () => {
      if (main.scrollTop / (main.scrollHeight - main.clientHeight) >= 0.2) {
        setIsResult(true);
      }
    };

    main.addEventListener("scroll", handleScroll);

    return () => {
      main.removeEventListener("scroll", handleScroll);
    };
  }, [ref]);

  return [isResult, setIsResult];
};
export default useScrollController;
