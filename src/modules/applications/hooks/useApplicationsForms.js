import { useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import formApis from "@/redux/apis/form.apis";

const { getSingleFormQuery } = formApis.endpoints;

// load and read each form's details
const useApplicationsForms = (formIds) => {
  const dispatch = useDispatch();
  const formIdsKey = formIds.join(",");

  useEffect(() => {
    if (!formIdsKey) return;
    const requests = formIdsKey.split(",").map((_id) => dispatch(getSingleFormQuery.initiate({ _id })));
    return () => requests.forEach((request) => request.unsubscribe());
  }, [dispatch, formIdsKey]);

  return useSelector(
    (state) => formIds.map((_id) => getSingleFormQuery.select({ _id })(state).data?.data).filter(Boolean),
    shallowEqual,
  );
};

export default useApplicationsForms;
