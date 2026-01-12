import React from 'react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const NavBar = () => {
  return (
        <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
            <a className="text-xl cursor-pointer font-bold" href='/home'>Bothsides</a>
        </div>
        <div className="flex gap-2">
            <input type="text" placeholder="Search" className="input h-8 input-bordered w-40 md:w-auto" />
                <SignedOut>
                    <SignInButton />
                    <SignUpButton>
                        <button className="bg-[#6c47ff] text-white px-5 py-2 rounded-full">
                        Sign Up
                        </button>
                    </SignUpButton>
                </SignedOut>

                    <SignedIn>
                        <UserButton />
                    </SignedIn>
            </div>
         </div>
  )
}

export default NavBar