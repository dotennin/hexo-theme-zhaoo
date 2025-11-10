/**
 * Enhanced Table Functionality
 * - Sticky header
 * - Sortable columns
 * - Responsive wrapper
 */

(function() {
  'use strict';

  function initTableEnhancements() {
    // Find all tables in post content
    const tables = document.querySelectorAll('.post-content table, .markdown-body table, .content table, article table');
    
    tables.forEach(table => {
      // Wrap table for responsive scrolling
      if (!table.parentElement.classList.contains('table-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
      
      // Add sorting functionality
      const thead = table.querySelector('thead');
      if (!thead) return;
      
      const headers = thead.querySelectorAll('th');
      headers.forEach((header, index) => {
        header.classList.add('sortable');
        header.dataset.column = index;
        
        // Add click event for sorting
        header.addEventListener('click', function() {
          sortTable(table, index, this);
        });
      });

      // Handle sticky header on scroll
      const scrollContainer = window; // or a specific scrolling element
      scrollContainer.addEventListener('scroll', () => handleStickyHeader(table, thead));
      // Initial check
      handleStickyHeader(table, thead);
    });
  }

  function handleStickyHeader(table, thead) {
    if (!thead) return;

    const tableRect = table.getBoundingClientRect();
    const headerHeight = document.querySelector('.header-inner')?.offsetHeight || 0;

    // Check if the table is within the viewport
    if (tableRect.top < window.innerHeight && tableRect.bottom > 0) {
      // The table is visible
      const stickyTop = Math.max(0, headerHeight - window.scrollY);
      
      if (tableRect.top < headerHeight) {
        // When scrolling down, header should stick below site header
        // 54px is fixed header height offset - 1px
        thead.style.transform = `translateY(${Math.max(0, -tableRect.top + headerHeight + 54)}px)`;
      } else {
        // When scrolling up, header is at its normal position
        thead.style.transform = 'translateY(0)';
      }
      
      // Make header sticky
      thead.querySelectorAll('th').forEach(th => {
        th.style.position = 'sticky';
        th.style.top = `${headerHeight}px`; // Stick below the site header
      });

    }
  }

  function sortTable(table, columnIndex, headerElement) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const currentSort = headerElement.classList.contains('sort-asc') ? 'asc' : 
                       headerElement.classList.contains('sort-desc') ? 'desc' : 'none';
    
    // Clear all sort indicators
    table.querySelectorAll('th').forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
    });
    
    // Determine new sort direction
    let newSort = 'asc';
    if (currentSort === 'none') {
      newSort = 'asc';
    } else if (currentSort === 'asc') {
      newSort = 'desc';
    } else {
      newSort = 'asc';
    }
    
    // Apply sort indicator
    headerElement.classList.add(`sort-${newSort}`);
    
    // Sort rows
    rows.sort((rowA, rowB) => {
      const cellA = rowA.querySelectorAll('td')[columnIndex];
      const cellB = rowB.querySelectorAll('td')[columnIndex];
      
      if (!cellA || !cellB) return 0;
      
      const valueA = getCellValue(cellA);
      const valueB = getCellValue(cellB);
      
      let comparison = 0;
      
      // Try numeric comparison first
      const numA = parseFloat(valueA);
      const numB = parseFloat(valueB);
      
      if (!isNaN(numA) && !isNaN(numB)) {
        comparison = numA - numB;
      } else {
        // Fallback to string comparison
        comparison = valueA.localeCompare(valueB, undefined, { numeric: true, sensitivity: 'base' });
      }
      
      return newSort === 'asc' ? comparison : -comparison;
    });
    
    // Reorder rows in DOM
    rows.forEach(row => tbody.appendChild(row));
  }

  function getCellValue(cell) {
    // Remove HTML tags and get text content
    let text = cell.textContent.trim();
    
    // Handle time format (MM:SS or HH:MM:SS)
    const timeMatch = text.match(/(\d+):(\d+)(?::(\d+))?/);
    if (timeMatch) {
      const hours = timeMatch[3] ? parseInt(timeMatch[1]) : 0;
      const minutes = timeMatch[3] ? parseInt(timeMatch[2]) : parseInt(timeMatch[1]);
      const seconds = timeMatch[3] ? parseInt(timeMatch[3]) : parseInt(timeMatch[2]);
      return hours * 3600 + minutes * 60 + seconds;
    }
    
    // Handle pace format (M:SS/km)
    const paceMatch = text.match(/(\d+):(\d+)\/km/);
    if (paceMatch) {
      return parseInt(paceMatch[1]) * 60 + parseInt(paceMatch[2]);
    }
    
    return text;
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTableEnhancements);
  } else {
    initTableEnhancements();
  }

  // Support for PJAX (if used)
  if (window.PJAX) {
    document.addEventListener('pjax:complete', initTableEnhancements);
  }

  // Expose for manual initialization if needed
  window.initTableEnhancements = initTableEnhancements;

})();
