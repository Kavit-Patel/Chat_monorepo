"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { addNewUser } from "../store/user/userApi";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { createdStatus } = useSelector((state: RootState) => state.user);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);

  const handleRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    if (photo) {
      formData.append("photo", photo);
    }
    dispatch(addNewUser(formData));
    setName("");
    setEmail("");
    setPassword("");
    setPhoto(null);
  };
  useEffect(() => {
    if (createdStatus === "success") {
      router.push("/");
    }
  }, [createdStatus]);

  return (
    <div className="w-full h-screen flex justify-center bg-gradient-to-tr from-orange-100 to-green-300">
      <div className="w-[50rem]   flex justify-center mt-24">
        <form
          onSubmit={(e) => handleRegistration(e)}
          encType="multipart/form-data"
          className="w-[50%] bg-gray-50 h-fit flex flex-col gap-4 px-8 py-12 border-2 rounded-lg"
        >
          <div className="flex justify-center mb-7">
            <h2 className="flex justify-center border-gray-400 text-gray-800 text-2xl border-b-2 pb-2 w-32">
              Register
            </h2>
          </div>
          <input
            className="border-b border-violet-600 bg-inherit w-full outline-none transition-all focus:border-b-2 focus:border-violet-900"
            type="text"
            placeholder="Enter Name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Your Photo
            </label>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setPhoto(e.target.files[0]);
                }
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm text-sm leading-4 font-medium text-gray-700"
            />
          </div>
          <input
            className="py-0.5 rounded-md border border-violet-700 transition-all hover:font-semibold hover:border-2 active:scale-95 "
            type="submit"
            value="Register"
          />
          <div className="  text-xs text-center">
            <span>
              Already Have an account?{" "}
              <Link href="/login" className="text-purple-800 ">
                Login
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default page;
