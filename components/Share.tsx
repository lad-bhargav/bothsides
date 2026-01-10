'use client';

import React, { useRef } from "react";
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon,
  WhatsappIcon,
  EmailIcon,
} from "react-share";
import { Share2 } from "lucide-react";

const ShareBtn = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const openModal = () => {
    dialogRef.current?.showModal();
  };

  return (
    <>
      <button
        className="btn btn-primary btn-xs mr-3"
        onClick={openModal}
      >
        <Share2 size={14} />
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            Share this page
          </h3>

          <div className="flex gap-4 justify-center flex-wrap">
            <FacebookShareButton url={shareUrl}>
              <FacebookIcon size={40} round />
            </FacebookShareButton>
            <TwitterShareButton url={shareUrl}>
              <TwitterIcon size={40} round />
            </TwitterShareButton>
            <LinkedinShareButton url={shareUrl}>
              <LinkedinIcon size={40} round />
            </LinkedinShareButton>
            <WhatsappShareButton url={shareUrl}>
              <WhatsappIcon size={40} round />
            </WhatsappShareButton>
            <EmailShareButton url={shareUrl}>
              <EmailIcon size={40} round />
            </EmailShareButton>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default ShareBtn;
