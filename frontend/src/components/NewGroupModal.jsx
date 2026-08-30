import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "./Modal";
import { useToast } from "../context/useToast";
import { createGroup } from "../services/group.service";
import { queryKeys } from "../queries/queryKeys";

const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Group name is required")
    .max(255, "Group name must be 255 characters or less"),
  description: z
    .string()
    .max(255, "Description must be 255 characters or less")
    .optional(),
});

export const NewGroupModal = ({ isOpen, onClose }) => {
  const [viewState, setViewState] = useState("form"); // "form" | "success"
  const [createdGroup, setCreatedGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleClose = () => {
    reset();
    setViewState("form");
    setCreatedGroup(null);
    onClose();
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const group = await createGroup(data);
      setCreatedGroup(group);
      setViewState("success");
    } catch (error) {
      showToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to create group. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!createdGroup?.inviteToken) return;
    const inviteLink = `${window.location.origin}/invite/${createdGroup.inviteToken}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      showToast({
        type: "success",
        message: "Link copied to clipboard!",
      });
    } catch (err) {
      showToast({
        type: "error",
        message: "Failed to copy link.",
      });
    }
  };

  const handleDone = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() });
    handleClose();
  };

  if (viewState === "success" && createdGroup) {
    const inviteLink = `${window.location.origin}/invite/${createdGroup.inviteToken}`;
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Group Created!"
        footer={
          <button
            type="button"
            onClick={handleDone}
            className="h-[40px] rounded-lg bg-primary px-6 font-label-sm text-label-sm text-on-primary transition-colors hover:bg-on-primary-fixed-variant"
          >
            Done
          </button>
        }
      >
        <div className="flex flex-col items-center justify-center text-center">
          {/* Success Icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
            <span
              className="material-symbols-outlined text-[32px] text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
            Share this link to invite members to {createdGroup.name}
          </p>

          {/* Invite Link Row */}
          <div className="relative flex w-full items-stretch">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="h-[40px] flex-1 rounded-l-lg border border-outline-variant bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface focus:border-outline-variant focus:ring-0 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex h-[40px] items-center rounded-r-lg border-y border-r border-primary bg-surface-container-lowest px-4 font-label-sm text-label-sm text-primary transition-colors hover:bg-primary-fixed/30"
            >
              Copy
            </button>
          </div>

          {/* Helper Text */}
          <p className="mt-2 w-full text-left font-label-sm text-[12px] text-on-surface-variant">
            Anyone with this link can join the group
          </p>
        </div>
      </Modal>
    );
  }

  // "form" state
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Group"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="hover:bg-surface-variant/50 rounded-lg px-5 py-2.5 font-body-md text-body-md font-semibold text-on-surface-variant transition-colors hover:text-on-surface disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="new-group-form"
            disabled={isLoading}
            className="rounded-lg bg-primary px-5 py-2.5 font-body-md text-body-md font-semibold text-on-primary shadow-sm transition-all outline-none hover:bg-primary/90 focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create Group"}
          </button>
        </>
      }
    >
      <form
        id="new-group-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {/* Group Name Input */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="group-name"
            className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase"
          >
            Group Name
          </label>
          <input
            id="group-name"
            type="text"
            placeholder="e.g. Goa Trip, Apartment 4B"
            {...register("name")}
            className={`w-full rounded-lg border bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface transition-all outline-none placeholder:text-outline focus:ring-2 ${
              errors.name
                ? "border-error focus:border-error focus:ring-error/20"
                : "border-outline-variant focus:border-primary focus:ring-primary/20"
            }`}
          />
          {errors.name && (
            <span className="font-label-sm text-label-sm text-error">
              {errors.name.message}
            </span>
          )}
        </div>

        {/* Description Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="group-description"
              className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase"
            >
              Description{" "}
              <span className="ml-1 font-normal tracking-normal text-on-surface-variant/80 lowercase">
                (Optional)
              </span>
            </label>
          </div>
          <textarea
            id="group-description"
            rows="3"
            placeholder="What's this group for?"
            {...register("description")}
            className={`w-full resize-none rounded-lg border bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface transition-all outline-none placeholder:text-outline focus:ring-2 ${
              errors.description
                ? "border-error focus:border-error focus:ring-error/20"
                : "border-outline-variant focus:border-primary focus:ring-primary/20"
            }`}
          />
          {errors.description && (
            <span className="font-label-sm text-label-sm text-error">
              {errors.description.message}
            </span>
          )}
        </div>
      </form>
    </Modal>
  );
};
