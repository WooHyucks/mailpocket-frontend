import { useEffect } from "react";

const Category = ({
  activeCategory,
  setActiveCategory,
  categories,
  setSubscribeable,
}: any) => {
  useEffect(() => {
    setSubscribeable([]);
  }, [activeCategory]);

  return (
    <>
      {categories
        .filter((category: any) => category.operating_status === true)
        .map((category: any) => {
          return (
            <button
              key={category.id}
              onClick={function () {
                setActiveCategory(category.id);
              }}
              className={`${
                activeCategory === category.id ||
                (!activeCategory && category.id === 0)
                  ? "bg-[#635C6D] text-white"
                  : "bg-[#EBEBEB]"
              } p-2 rounded-xl font-bold text-xs`}
            >
              {category.name}
            </button>
          );
        })}
    </>
  );
};

export { Category };
