"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { useRouter } from "next/navigation";
import { cookieAutoLogin, loginUser } from "../store/user/userApi";

const page = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loginStatus } = useSelector((state: RootState) => state.user);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };
  useEffect(() => {
    dispatch(cookieAutoLogin());
  }, []);
  useEffect(() => {
    if (loginStatus === "success") {
      router.push("/");
    }
  }, [loginStatus]);

  return (
    <div className="w-full h-screen flex justify-center bg-gradient-to-tr from-orange-100 to-green-300">
      <div className="w-[50rem]   flex justify-center mt-24">
        <form
          onSubmit={(e) => handleLogin(e)}
          className="w-[50%] bg-gray-50 h-fit flex flex-col gap-4 px-8 py-12 border-2 rounded-lg"
        >
          <div className="flex justify-center mb-7">
            <h2 className="flex justify-center cursor-pointer border-gray-400 text-gray-800 text-2xl border-b-2 pb-2 w-32">
              Login
            </h2>
          </div>

          <input
            className="border-b border-violet-600 bg-inherit w-full outline-none transition-all focus:border-b-2 focus:border-violet-900"
            type="text"
            placeholder="Enter Email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border-b border-violet-600 bg-inherit w-full outline-none transition-all focus:border-b-2 focus:border-violet-900"
            type="text"
            placeholder="Enter Password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            className="py-0.5 rounded-md border cursor-pointer border-violet-600 transition-all  hover:border-violet-950 hover:text-violet-950 active:scale-95 "
            type="submit"
            value="Login"
          />
          <div className="  text-xs text-center">
            <span>
              Don't Have an account?{" "}
              <Link href="/register" className="text-purple-800 ">
                Register
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default page;
