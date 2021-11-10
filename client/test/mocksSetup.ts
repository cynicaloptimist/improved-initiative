import axios from "axios";

jest.mock("axios");

const axiosMock = axios as jest.Mocked<typeof axios>;

axiosMock.get.mockResolvedValue({ data: {} });
