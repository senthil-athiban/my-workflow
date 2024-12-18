"use client";

import React, { useState } from "react";
import ProviderButton from "../Button/ProviderButton";
import Google from "../Provider/Google";
import Facebook from "../Provider/Facebook";
import Microsoft from "../Provider/Microsoft";
import PrimaryButton from "../Button/PrimaryButton";
import Link from "next/link";
import { BACKEND_URL } from "@/app/config";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import useAxios from "@/hooks/useAxios";

const LoginCard = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const axiosInstance = useAxios();
  const handleGoogleAuth = async () => {
    // const res = await axiosInstance.get("/api/v1/auth/google");
    const res = window.open("http://localhost:8000/google-login", "_self");
  }
  return (
    <div className="border grid flex-col gap-y-4 p-10 shadow-md rouned-lg">
      <ProviderButton className="bg-sky-600" icon={<Google />} onClick={handleGoogleAuth}>
        Continue with google
      </ProviderButton>
      <ProviderButton className="bg-blue-600" icon={<Facebook />}>
        Continue with Facebook
      </ProviderButton>
      <ProviderButton className="bg-slate-900" icon={<Microsoft />}>
        Continue with Microsoft
      </ProviderButton>
      <div className="flex justify-center items-center my-4">
        <div className="border-t border-gray-300 flex-grow mr-3"></div>
        <span className="flex-shrink">OR</span>
        <div className="border-t border-gray-300 flex-grow ml-3"></div>
      </div>
      <div className="flex flex-col gap-y-2">
        <label htmlFor="email" className="text-sm">
          <span className="absolut left-0 top-0 mr-1">*</span>Email (required)
        </label>
        <input
          type="text"
          className="p-2 border bg-orange-50 rounded-lg"
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password" className="text-sm">
          <span className="absolut left-0 top-0 mr-1">*</span>password
          (required)
        </label>
        <input
          type="text"
          className="p-2 border bg-orange-50 rounded-lg"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="flex justify-center">
        <PrimaryButton
          onClick={async () => {
            const res = await axios.post(`/api/v1/auth/signin`, {
              email: email,
              password: password,
            });
            console.log(' res: ', res);
            const accessToken = res.data.message.accesstoken;
            console.log(' accessToken : ', accessToken);
            localStorage.setItem('token', accessToken);
            router.push("/dashboard");
          }}
          size="lg"
          // disabled={true}
        >
          Continue
        </PrimaryButton>
      </div>
      <div>
        <p className="font-normal text-xs">
          Don{"'"}t have a Zapier account yet?
          <Link href={"/signup"} className="text-blue-500 underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginCard;
