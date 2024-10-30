import React, { forwardRef, useImperativeHandle } from 'react';

import { useFormContext, Controller } from 'react-hook-form';
import { FilesPreview } from './file-preview';
// import { AtSign, CaseSensitive, Mic, Paperclip, Send, Smile, Video } from 'lucide-react';
import { observer } from 'mobx-react';


declare type TPosition = "top" | "right" | "bottom" | "left" | "auto" | "auto-end" | "auto-start" | "bottom-left" | "bottom-right" | "left-bottom" | "left-top" | "right-bottom" | "right-top" | "top-left" | "top-right";

interface ITooltipProps {
  tooltipHeading?: string;
  tooltipContent: string | React.ReactNode;
  position?: TPosition;
  children: JSX.Element;
  disabled?: boolean;
  className?: string;
  openDelay?: number;
  closeDelay?: number;
  openOnTargetFocus?: boolean;
}
declare const Tooltip: React.FC<ITooltipProps>;

export const FILE_EXTENSIONS_REGEX = /\.(png|jpg|jfif|jpeg|pjpeg|pjp|webp|avif|xls|xlsx|pdf|txt|docx|xml|mp4|mov)$/i;

export const MAX_FILE_UPLOAD_SIZE = 10;


// Functional wrapper component
export const UserUploadForm = observer(forwardRef((props: any, ref: any) => {

  const {
    formState: { errors },
    setValue,
    getValues,
    watch,
    setError,
    clearErrors,
    reset,
    control,
  } = useFormContext<{
    chatbox__input: string;
    file: FileList | null;
  }>();

  useImperativeHandle(ref, () => ({

  }));

  const file = watch("file");

  const handleChangeFile = (files: any, field: any) => {
    const _file = files[0];
    let error: string | null = null;
    if (!_file) {
      error = "Please select a file.";
    }
    if (_file.size && _file.size > 1024 * 1024 * MAX_FILE_UPLOAD_SIZE) {
      error = "Please select a file smaller than 5MB.";
    }
    if (_file.name && !FILE_EXTENSIONS_REGEX.test(_file.name)) {
      error = "Please select an image, video, document or pdf file.";
    }
    if (error) {
      setError("file", {
        message: error,
        type: "custom"
      });
      return;
    } else {
      clearErrors("file");
      field.onChange && field.onChange(files);
    }
  };


  return (
    <div>
      <FilesPreview data={file} setValue={setValue} />
      <div className="h-fit cursor-pointer">
        <Controller
          name="file"
          control={control}
          defaultValue={null}
          render={({ field }) => (
            <>
              <input
                type="file"
                id="fileInput"
                multiple
                style={{ display: 'none' }}
                onChange={(e: any) => handleChangeFile(e.target.files, field)}
              />
              <Tooltip tooltipContent={file ? "Edit" : "Upload File"} openOnTargetFocus={false} position="top">
                <i
                  className="codicon cloud-upload"
                  onClick={() => document?.getElementById('fileInput')?.click()}
                />
              </Tooltip>
            </>
          )}
        />
      </div>
    </div>
  );
}));