import { Skeleton } from "./ui/skeleton";

const CategorySkeleton = () => {
  return (
    <>
      {[...Array(8)].map((_, index) => (
        <Skeleton
          key={index}
          className="h-9 w-20 rounded-xl"
        />
      ))}
    </>
  );
};

export { CategorySkeleton };

