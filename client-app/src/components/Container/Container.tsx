import * as React from 'react';
import FormContainer from '../FormContainer/FormContainer';
import { UrlData } from '../../interface/UrlData';
import { serverUrl } from '../../helpers/Constants';
import axios from 'axios';
import DataTable from '../DataTable/DataTable';

interface IContainerProps {}

const Container: React.FunctionComponent<IContainerProps> = () => {
  const [data, setData] = React.useState<UrlData[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  const fetchTableData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const response = await axios.get(`${serverUrl}/shortUrl`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
      setFetchError('Unable to connect to the backend server. Please verify it is running.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <FormContainer onUrlCreated={fetchTableData} />
      {fetchError && (
        <div className="my-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300 text-center">
          {fetchError}
        </div>
      )}
      <DataTable
        data={data}
        isLoading={isLoading}
        onRefresh={fetchTableData}
      />
    </div>
  );
};

export default Container;
