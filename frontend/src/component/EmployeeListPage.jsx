// frontend/src/component/EmployeeListPage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEmployees, setFilters, selectFilteredEmployees } from '../store/employeeSlice';
import { fetchDepartments } from '../store/companySlice';

const EmployeeListPage = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const filteredEmployees = useSelector(selectFilteredEmployees);
  const { loading, errors, filters } = useSelector((state) => state.employees);
  const { departments } = useSelector((state) => state.company);
  
  // Local state for search
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch employees and departments on component mount
    dispatch(fetchEmployees());
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    // Update filters when search term changes
    dispatch(setFilters({ search: searchTerm }));
  }, [searchTerm, dispatch]);

  const StatusPill = ({ status }) => {
    const isActive = status === 'Active' || status === true;
    
    const pillStyle = {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '600',
      color: 'white',
      backgroundColor: isActive ? '#10b981' : '#ef4444',
      textAlign: 'center',
      minWidth: '70px'
    };

    return <span style={pillStyle}>{isActive ? 'Active' : 'Inactive'}</span>;
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ [filterType]: value }));
  };

  if (loading.list) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading employees...
        </div>
      </div>
    );
  }

  if (errors.list) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
          Error: {errors.list}
        </div>
      </div>
    );
  }

  const containerStyle = {
    padding: '24px',
    backgroundColor: '#f3f4f6',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  const headingStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#8b5cf6',
    marginBottom: '24px',
    letterSpacing: '-0.025em'
  };

  const filtersStyle = {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  };

  const filterInputStyle = {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
  };

  const headerStyle = {
    backgroundColor: '#8b5cf6',
    borderBottom: '1px solid #7c3aed'
  };

  const headerCellStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  const rowStyle = {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.15s ease-in-out'
  };

  const cellStyle = {
    padding: '16px',
    fontSize: '16px',
    color: '#374151'
  };

  const nameStyle = {
    fontWeight: '600',
    color: '#111827'
  };

  const emailStyle = {
    color: '#6b7280'
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Employees ({filteredEmployees.length})</h1>
      
      {/* Filters */}
      <div style={filtersStyle}>
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={filterInputStyle}
        />
        
        <select
          value={filters.department}
          onChange={(e) => handleFilterChange('department', e.target.value)}
          style={filterInputStyle}
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.name}>{dept.name}</option>
          ))}
        </select>
        
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          style={filterInputStyle}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      
      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead style={headerStyle}>
            <tr>
              <th style={headerCellStyle}>Employee ID</th>
              <th style={headerCellStyle}>Name</th>
              <th style={headerCellStyle}>Department</th>
              <th style={headerCellStyle}>Position</th>
              <th style={headerCellStyle}>Email</th>
              <th style={headerCellStyle}>Phone</th>
              <th style={headerCellStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee, index) => (
              <tr 
                key={employee.id} 
                style={{
                  ...rowStyle,
                  backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ede9fe';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafafa';
                }}
              >
                <td style={cellStyle}>
                  <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                    {employee.employee_id}
                  </span>
                </td>
                <td style={{...cellStyle, ...nameStyle}}>
                  {employee.user ? `${employee.user.first_name} ${employee.user.last_name}` : 'N/A'}
                </td>
                <td style={cellStyle}>
                  {employee.department_name || 'No Department'}
                </td>
                <td style={cellStyle}>
                  {employee.position || employee.role || 'N/A'}
                </td>
                <td style={{...cellStyle, ...emailStyle}}>
                  {employee.user?.email || 'N/A'}
                </td>
                <td style={cellStyle}>
                  {employee.user?.phone || 'N/A'}
                </td>
                <td style={cellStyle}>
                  <StatusPill status={employee.is_active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredEmployees.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            No employees found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeListPage;