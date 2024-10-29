import { memo, useMemo } from "react";
import { UseFormSetValue } from "react-hook-form";
// ui
import { FileText, PlayCircle, XCircle } from "lucide-react";
// helpers
import { convertFileSize } from "../../../../helpers/string.helper";
import CustomImage from './image'
import { rootStore, RootStore } from "src/stores";
import { inject } from "mobx-react";


interface IFilesPreview {
  data: FileList | null;
  setValue: UseFormSetValue<{
    chatbox__input: string;
    file: FileList | null;
  }>;
}

interface IFileView {
  data: File;
  handleRemoveFile: () => void;
}

const FileView = memo(({ data, handleRemoveFile }: IFileView) => {
  const { name, type, lastModified, size } = data;

  const isImage = type && type.startsWith("image/");
  const isVideo = type && type.startsWith("video/");

  const mediaSrc = useMemo(() => {
    if (!isImage && !isVideo) return undefined;
    return URL.createObjectURL(data);
  }, [lastModified]);

  // handlers
  const handleRemove = (e: any) => {
    e.preventDefault();
    handleRemoveFile();
  };

  const handleView = (e: any) => {
    const reader = new FileReader();
    reader.onload = () => {
      const fileURL = URL.createObjectURL(data);
      window.open(fileURL, '_blank');
    };
    reader.readAsDataURL(data);
  };


  return (
    <div className="w-[120px] h-[120px] rounded-md p-1.5 relative border">
      <div onClick={handleView} className="w-full h-full cursor-pointer relative">
        {isImage && mediaSrc
          ? (
            <CustomImage
                          alt={name || "preview"}
                          src={mediaSrc}
                          fill
                          className="object-contain image-preview" width={undefined} height={undefined} style={undefined}            />
          )
          : isVideo && mediaSrc
            ? (
              <>
                <video
                  className="object-cover w-full h-full"
                  preload='metadata'
                  src={mediaSrc}
                />
                <PlayCircle className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer text-custom-text-200 hover:text-custom-text-400" />
              </>
            )
            : (
              <div className="w-full h-full flex flex-col justify-between">
                <FileText size={40} className="block text-custom-text-200" />
                <div>
                  <p title={name} className="w-full text-xs font-medium line-clamp-1">{name}</p>
                  <p className="w-full text-xs line-clamp-1">{convertFileSize(size)}</p>
                </div>
              </div>
            )}
      </div>
      <div
        className="w-5 h-5 absolute -right-2 -top-2 p-1 rounded-full"
        onClick={handleRemove}
      >
        <XCircle className="w-4 h-4 cursor-pointer text-custom-text-200 hover:text-custom-text-400" />
      </div>
    </div>
  );
});

FileView.displayName = "FileView";

export const FilesPreview = (props: IFilesPreview) => {
  const { data, setValue } = props;
  if (!data) return null;

  const {zulipService} = rootStore;

  // format FileList object to array, do not mutate this
  const list = Array.from(data).map((file) => file);

  const arrayToFileList = (filesArray: File[]) => {
    const dataTransfer = new DataTransfer();
    filesArray.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFilesArray = list.filter((_, index) => index !== indexToRemove);

    if (updatedFilesArray.length === 0) {
      const input = document.getElementById("fileInput");
      if (input) (input as any).value = null;
      setValue("file", null);
    } else {
      const updatedFileList = arrayToFileList(updatedFilesArray);
      setValue("file", updatedFileList);
    }
  };

  return (
    <div className="w-full flex overflow-y-auto flex-row gap-x-2 vertical-scrollbar scrollbar-lg pt-1">
      {list.map((file, index) => (
        <FileView
          key={file.lastModified}
          data={file}
          handleRemoveFile={() => handleRemoveFile(index)}
        />
      ))}
    </div>
  );
};