/**
 * Enhanced Table Functionality
 * - Floating header below the fixed navbar
 * - Sortable columns
 * - Responsive wrapper
 */

(function() {
  'use strict';

  let floatingHeaders = [];
  let floatingHeaderTicking = false;
  let floatingHeaderListenersBound = false;

  function initTableEnhancements() {
    // Find all tables in post content
    const tables = document.querySelectorAll('.post-content table, .markdown-body table, .content table, article table');
    floatingHeaders.forEach(({ thead }) => {
      thead.style.transform = '';
      thead.classList.remove('is-floating');
    });
    floatingHeaders = [];
    
    tables.forEach(table => {
      // Wrap table for responsive scrolling
      if (!table.parentElement.classList.contains('table-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
      const wrapper = table.parentElement;
      setupScrollAffordance(wrapper);
      
      // Add sorting functionality
      const thead = table.querySelector('thead');
      if (!thead) return;
      
      const headers = thead.querySelectorAll('th');
      headers.forEach((header, index) => {
        header.classList.add('sortable');
        header.dataset.column = index;
        header.tabIndex = 0;
        header.setAttribute(
          'aria-sort',
          header.classList.contains('sort-asc') ? 'ascending' :
            header.classList.contains('sort-desc') ? 'descending' : 'none'
        );

        if (header.dataset.tableSortInitialized === 'true') return;
        header.dataset.tableSortInitialized = 'true';
        
        // Add click event for sorting
        header.addEventListener('click', function() {
          sortTable(table, index, this);
        });
        header.addEventListener('keydown', function(event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            sortTable(table, index, this);
          }
        });
      });

      floatingHeaders.push({ table, thead, wrapper, offset: 0 });
    });

    bindFloatingHeaderListeners();
    updateFloatingHeaders();
  }

  function bindFloatingHeaderListeners() {
    if (floatingHeaderListenersBound) return;
    floatingHeaderListenersBound = true;
    window.addEventListener('scroll', requestFloatingHeaderUpdate, { passive: true });
    window.addEventListener('resize', requestFloatingHeaderUpdate);
  }

  function requestFloatingHeaderUpdate() {
    if (floatingHeaderTicking) return;
    floatingHeaderTicking = true;
    window.requestAnimationFrame(updateFloatingHeaders);
  }

  function setupScrollAffordance(wrapper) {
    updateScrollAffordance(wrapper);
    if (wrapper.dataset.tableScrollInitialized === 'true') return;
    wrapper.dataset.tableScrollInitialized = 'true';

    let ticking = false;
    wrapper.addEventListener('scroll', function() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function() {
        updateScrollAffordance(wrapper);
        ticking = false;
      });
    }, { passive: true });
  }

  function updateScrollAffordance(wrapper) {
    const maxScrollLeft = Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);
    const canScroll = maxScrollLeft > 1;
    wrapper.classList.toggle('can-scroll-left', canScroll && wrapper.scrollLeft > 1);
    wrapper.classList.toggle('can-scroll-right', canScroll && wrapper.scrollLeft < maxScrollLeft - 1);

    if (canScroll) {
      wrapper.tabIndex = 0;
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-label', '可横向滚动的表格');
    } else {
      wrapper.removeAttribute('tabindex');
      wrapper.removeAttribute('role');
      wrapper.removeAttribute('aria-label');
    }
  }

  function updateFloatingHeaders() {
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;

    floatingHeaders.forEach(item => {
      const { table, thead, wrapper } = item;
      if (!document.contains(table)) return;
      updateScrollAffordance(wrapper);
      const tableRect = table.getBoundingClientRect();
      const headerHeight = thead.offsetHeight;
      const naturalHeaderTop = thead.getBoundingClientRect().top - item.offset;
      const desiredOffset = Math.max(0, navbarHeight - naturalHeaderTop);
      const maxOffset = Math.max(0, tableRect.bottom - headerHeight - naturalHeaderTop);
      const offset = tableRect.bottom > 0 ? Math.min(desiredOffset, maxOffset) : 0;

      thead.style.transform = offset > 0 ? `translateY(${offset}px)` : '';
      thead.classList.toggle('is-floating', offset > 0);
      item.offset = offset;
    });

    floatingHeaderTicking = false;
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
      th.setAttribute('aria-sort', 'none');
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
    headerElement.setAttribute('aria-sort', newSort === 'asc' ? 'ascending' : 'descending');
    
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

  // Support the theme's jQuery PJAX lifecycle without duplicating handlers.
  if (window.jQuery) {
    window.jQuery(document)
      .off('pjax:complete.tableEnhance')
      .on('pjax:complete.tableEnhance', initTableEnhancements);
  } else {
    document.addEventListener('pjax:complete', initTableEnhancements);
  }

  // Expose for manual initialization if needed
  window.initTableEnhancements = initTableEnhancements;

})();
