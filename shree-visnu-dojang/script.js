const filterButton = document.querySelector('.filter-btn');
const cards = document.querySelectorAll('.schedule-card');

if (filterButton) {
  filterButton.addEventListener('click', () => {
    const currentFilter = filterButton.dataset.filter === 'all' ? 'all' : filterButton.dataset.filter;
    cards.forEach((card) => {
      const show = currentFilter === 'all' || card.dataset.group === currentFilter;
      card.style.display = show ? 'flex' : 'none';
    });
  });
}
