import { useState, useEffect, useRef } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import { BottomSheetContent } from "./BottomSheetContent";

export const Sheet = ({ open, setOpen, mailData }: any) => {
  return (
    <>
      <BottomSheet header={false} open={open} scrollLocking={true}>
        <div className="mt-4">
          <BottomSheetContent
            setOpen={setOpen}
            mailData={mailData}
          ></BottomSheetContent>
        </div>
      </BottomSheet>
    </>
  );
};
