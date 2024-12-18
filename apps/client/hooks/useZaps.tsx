import { BACKEND_URL } from '@/app/config';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import useAxios from './useAxios';

const useZaps = () => {
    const [isLoading, setisLoading] = useState(false);
    const [data, setdata] = useState([]);
    const axiosInstance = useAxios();
    useEffect(() => {
        setisLoading(true);
        async function fetchData() {
            const res = await axiosInstance.get(`${BACKEND_URL}/api/v1/zap`);
            setdata(res.data.zap);
            setisLoading(false);
        }
        fetchData();
    }, [axiosInstance]);
  return {
    isLoading, data
  }
}

export default useZaps