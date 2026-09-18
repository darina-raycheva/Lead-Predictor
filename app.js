document.querySelectorAll('input[type="range"]').forEach((range) => {
  const output = range.parentElement.querySelector('output');

  const updateOutput = () => {
    output.value = `${Number(range.value).toFixed(2)}%`;
    output.textContent = output.value;
  };

  range.addEventListener('input', updateOutput);
  updateOutput();
});

const campaignForm = document.querySelector('#campaign-form');

if (campaignForm) {
  const language = document.querySelector('#language');
  const currency = document.querySelector('#currency');
  const campaignStart = document.querySelector('#campaign-start');
  const campaignEnd = document.querySelector('#campaign-end');
  const totalRevenue = document.querySelector('#total-revenue');
  const orderValue = document.querySelector('#order-value');
  const currencySymbols = document.querySelectorAll('.currency-symbol');
  const summary = document.querySelector('#campaign-summary');
  const detail = document.querySelector('#campaign-detail');
  const status = document.querySelector('.summary-status');

  const formatMoney = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.value,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

  const formatDate = (value) => new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));

  const updateCampaignSummary = () => {
    const start = new Date(`${campaignStart.value}T00:00:00`);
    const end = new Date(`${campaignEnd.value}T00:00:00`);
    const revenue = Number(totalRevenue.value);
    const averageOrder = Number(orderValue.value);
    const validDates = campaignStart.value && campaignEnd.value && end >= start;
    const validNumbers = revenue >= 0 && averageOrder > 0;

    campaignEnd.min = campaignStart.value;
    status.classList.toggle('is-invalid', !validDates || !validNumbers);
    status.textContent = validDates && validNumbers ? 'Ready' : 'Check values';

    if (!validDates) {
      summary.textContent = 'Campaign end must be after the start date.';
      detail.textContent = 'Choose a valid campaign period to continue.';
      return;
    }

    const months = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30.4375)));
    const estimatedOrders = Math.floor(revenue / averageOrder);
    summary.textContent = `${months} month${months === 1 ? '' : 's'} · ${formatMoney(revenue)} revenue target`;
    detail.textContent = `${formatDate(campaignStart.value)} to ${formatDate(campaignEnd.value)} · Average order value: ${formatMoney(averageOrder)} · Estimated orders: ${estimatedOrders}`;
  };

  const updateCurrency = () => {
    const symbol = currency.options[currency.selectedIndex].dataset.symbol;
    currencySymbols.forEach((element) => { element.textContent = symbol; });
    updateCampaignSummary();
  };

  campaignForm.addEventListener('input', updateCampaignSummary);
  language.addEventListener('change', updateCampaignSummary);
  currency.addEventListener('change', updateCurrency);
  updateCurrency();
}
