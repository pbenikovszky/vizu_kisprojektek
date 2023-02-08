document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', () => {
    window.location.href = card.getAttribute('data-target')
  })
})
