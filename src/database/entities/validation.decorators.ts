// Custom validation decorators for database constraints
import { Check } from 'typeorm';

/**
 * Check constraint decorators to match SQL schema validation
 * These ensure data integrity at the database level
 */

// For subscription entity
export const PriceNonNegativeCheck = Check(
  'ck_price_nonneg',
  'price_amount_micros IS NULL OR price_amount_micros >= 0',
);
export const CurrencyLengthCheck = Check(
  'ck_currency_len',
  'char_length(currency) = 3',
);
export const CountryLengthCheck = Check(
  'ck_country_len',
  'char_length(country) = 2',
);

// For provider transaction entity
export const TransactionAmountNonNegativeCheck = Check(
  'ck_tx_amount_nonneg',
  'gross_amount_micros >= 0',
);
export const TaxAmountNonNegativeCheck = Check(
  'ck_tx_tax_nonneg',
  'tax_amount_micros IS NULL OR tax_amount_micros >= 0',
);

/**
 * Usage example:
 *
 * @Entity('subscriptions')
 * @PriceNonNegativeCheck
 * @CurrencyLengthCheck
 * @CountryLengthCheck
 * export class Subscription extends BaseEntityTimestamps {
 *   // ... entity definition
 * }
 */
