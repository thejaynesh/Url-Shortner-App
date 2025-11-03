import * as React from 'react';
import FormContainer from '../FormContainer/FormContainer';
import { UrlData } from '../../interface/UrlData';
import { api } from '../../helpers/api';
import DataTable from '../DataTable/DataTable';
import { useAuth } from '../../context/AuthContext';

const Container: React.FC = () => {
  const [data, setData] = React.useState<UrlData[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();

  const fetchTableData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const response = await api.get<UrlData[]>('/shortUrl');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
      setFetchError('Unable to connect to the LinkFlow backend server. Please verify it is running.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTableData();
  }, [fetchTableData, isAuthenticated, user]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FormContainer onUrlCreated={fetchTableData} />

      {fetchError && (
        <div className="my-6 p-4 text-sm text-rose-300 bg-rose-950/70 rounded-2xl border border-rose-800 text-center flex items-center justify-center gap-2">
          <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{fetchError}</span>
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
