import axios from "axios";
import * as React from "react";

export const useRequest = (url: string, method: "get" | "post" = "get") => {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState<string>(null);
  const [loading, setloading] = React.useState(true);

  const fetchData = () => {
    axios[method](url)
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setloading(false);
      });
  };

  React.useEffect(() => {
    fetchData();
  }, [method, url]);

  return { data, error, loading };
};
