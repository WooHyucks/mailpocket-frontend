import { CategorySkeleton } from "./CategorySkeleton";

const Category = ({
  activeCategory,
  setActiveCategory,
  categories,
  isLoading,
}: any) => {
  if (isLoading) {
    return <CategorySkeleton />;
  }

  return (
    <>
      {categories
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
              } p-2 rounded-xl font-bold text-xs whitespace-nowrap`}
            >
              {category.name}
            </button>
          );
        })}
    </>
  );
};

export { Category };
