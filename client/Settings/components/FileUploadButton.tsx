import * as React from "react";

export const FileUploadButton = (props: {
  handleFile: (file: File) => void;
  acceptFileType: string;
  fontAwesomeIcon: string;
}) => {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      props.handleFile(file);
    }
  };

  return (
    <label>
      <input
        className="hidden-input"
        type="file"
        accept={props.acceptFileType}
        onChange={onChange}
      />
      <span className={"c-button fas fa-" + props.fontAwesomeIcon} />
    </label>
  );
};
