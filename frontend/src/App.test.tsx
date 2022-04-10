import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("covers basic case", async () => {
  const files = [
    new File(["hello"], "hello.png", { type: "image/png" }),
    new File(["there"], "there.png", { type: "image/png" }),
  ];

  render(
    <div>
      <label htmlFor="file-uploader">Upload file:</label>
      <input id="file-uploader" type="file" multiple />
    </div>
  );
  const button = screen.getByText(/Upload file:/i);
  expect(button).toBeInTheDocument();
  const input = screen.getByLabelText(/upload file:/i);
  userEvent.upload(input, files);
  const fileElement = document.getElementById(
    "file-uploader"
  ) as HTMLInputElement;

  expect(fileElement?.files).toHaveLength(2);
});
