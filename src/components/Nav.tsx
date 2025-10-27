import { useState } from "react";
import { decodedToken, Token } from "../api/api";
import SignUp from "./Modal/SignUp";

interface NavPropsType {
  setAuthOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  authTokenDecode: any;
}

const Nav = ({ setAuthOpenModal, authTokenDecode }: NavPropsType) => {
  return (
    <div className="flex items-center justify-between">
      <img className="h-6 m-5 md:w-[90px] md:mt-[10px] md:ml-[10px] md:h-[20px]"
        src="/images/MailpocketLogo.png"
        alt="Logo"
        onClick={() => (window.location.href = "/landingpage")}
      />
      {authTokenDecode === false ? (<span className="cursor-pointer text-customPurple font-bold  mr-3" onClick={() => setAuthOpenModal(true)}>로그인 하기</span>
      ) : ""}
    </div>

  )
}

export default Nav