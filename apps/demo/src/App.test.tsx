import { fireEvent, render, screen } from "@testing-library/react";

import { App } from "./App";

describe("Demo app", () => {
  it("shows a live slider monitor when live device mode is enabled", () => {
    render(<App />);

    expect(
      screen.queryByRole("heading", { name: "Live Slider Monitor" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Live device" }));

    expect(
      screen.getByRole("heading", { name: "Live Slider Monitor" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Live slider monitor preview" }),
    ).toBeInTheDocument();
  });
});
