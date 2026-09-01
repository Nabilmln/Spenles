import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { Database } from "@/db/types";
import {
  BACKUP_SCHEMA_VERSION,
  REPORT_CURRENCY,
  REPORT_TIMEZONE,
} from "../constants";

export async function getPersonalDataBackupJson(
  userId: string,
  exportedAt: Date,
  database: Database = db,
) {
  const result = await database.execute<{ backup_json: string }>(sql`
    select jsonb_build_object(
      'schemaVersion', ${BACKUP_SCHEMA_VERSION}::text,
      'application', 'Spenles',
      'exportedAt', ${exportedAt.toISOString()}::text,
      'timezone', ${REPORT_TIMEZONE}::text,
      'currency', ${REPORT_CURRENCY}::text,
      'owner', jsonb_build_object(
        'profileId', owned_profile.id
      ),
      'data', jsonb_build_object(
        'profile', jsonb_build_object(
          'id', owned_profile.id,
          'displayName', owned_profile.display_name,
          'defaultCurrency', owned_profile.default_currency,
          'timezone', owned_profile.timezone,
          'theme', owned_profile.theme,
          'createdAt', owned_profile.created_at,
          'updatedAt', owned_profile.updated_at
        ),
        'accounts', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', owned_account.id,
            'name', owned_account.name,
            'type', owned_account.type,
            'currency', owned_account.currency,
            'openingBalanceIdr', owned_account.opening_balance::text,
            'status', owned_account.status,
            'createdAt', owned_account.created_at,
            'updatedAt', owned_account.updated_at
          ) order by owned_account.created_at, owned_account.id)
          from accounts as owned_account
          where owned_account.user_id = ${userId}
        ), '[]'::jsonb),
        'categories', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', owned_category.id,
            'name', owned_category.name,
            'type', owned_category.type,
            'icon', owned_category.icon,
            'color', owned_category.color,
            'isDefault', owned_category.is_default,
            'status', owned_category.status,
            'createdAt', owned_category.created_at,
            'updatedAt', owned_category.updated_at
          ) order by owned_category.created_at, owned_category.id)
          from categories as owned_category
          where owned_category.user_id = ${userId}
        ), '[]'::jsonb),
        'transactions', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', owned_transaction.id,
            'accountId', owned_transaction.account_id,
            'categoryId', owned_transaction.category_id,
            'type', owned_transaction.type,
            'amountIdr', owned_transaction.amount::text,
            'transactionAt', owned_transaction.transaction_at,
            'note', owned_transaction.note,
            'createdAt', owned_transaction.created_at,
            'updatedAt', owned_transaction.updated_at,
            'deletedAt', owned_transaction.deleted_at
          ) order by owned_transaction.transaction_at, owned_transaction.id)
          from transactions as owned_transaction
          where owned_transaction.user_id = ${userId}
        ), '[]'::jsonb),
        'transfers', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', owned_transfer.id,
            'sourceAccountId', owned_transfer.source_account_id,
            'destinationAccountId', owned_transfer.destination_account_id,
            'amountIdr', owned_transfer.amount::text,
            'transferredAt', owned_transfer.transferred_at,
            'note', owned_transfer.note,
            'reversalOfId', owned_transfer.reversal_of_id,
            'createdAt', owned_transfer.created_at,
            'updatedAt', owned_transfer.updated_at
          ) order by owned_transfer.transferred_at, owned_transfer.id)
          from transfers as owned_transfer
          where owned_transfer.user_id = ${userId}
        ), '[]'::jsonb),
        'budgets', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', owned_budget.id,
            'categoryId', owned_budget.category_id,
            'budgetMonth', owned_budget.budget_month,
            'amountIdr', owned_budget.amount::text,
            'warningThresholdBps', owned_budget.warning_threshold_bps,
            'status', owned_budget.status,
            'createdAt', owned_budget.created_at,
            'updatedAt', owned_budget.updated_at
          ) order by owned_budget.budget_month, owned_budget.id)
          from budgets as owned_budget
          where owned_budget.user_id = ${userId}
        ), '[]'::jsonb),
        'recurringRules', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', owned_rule.id,
            'type', owned_rule.type,
            'amountIdr', owned_rule.amount::text,
            'accountId', owned_rule.account_id,
            'categoryId', owned_rule.category_id,
            'frequency', owned_rule.frequency,
            'startAt', owned_rule.start_at,
            'endDate', owned_rule.end_date,
            'nextOccurrenceAt', owned_rule.next_occurrence_at,
            'status', owned_rule.status,
            'pauseReason', owned_rule.pause_reason,
            'note', owned_rule.note,
            'lastFailureCode', owned_rule.last_failure_code,
            'lastFailureAt', owned_rule.last_failure_at,
            'createdAt', owned_rule.created_at,
            'updatedAt', owned_rule.updated_at
          ) order by owned_rule.created_at, owned_rule.id)
          from recurring_rules as owned_rule
          where owned_rule.user_id = ${userId}
        ), '[]'::jsonb),
        'recurringGenerations', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', owned_generation.id,
            'recurringRuleId', owned_generation.recurring_rule_id,
            'scheduledFor', owned_generation.scheduled_for,
            'transactionId', owned_generation.transaction_id,
            'generatedAt', owned_generation.generated_at
          ) order by owned_generation.generated_at, owned_generation.id)
          from recurring_generations as owned_generation
          where owned_generation.user_id = ${userId}
        ), '[]'::jsonb),
        'splitBills', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', owned_bill.id,
            'merchantName', owned_bill.merchant_name,
            'billDate', owned_bill.bill_date,
            'note', owned_bill.note,
            'status', owned_bill.status,
            'discountMode', owned_bill.discount_mode,
            'fixedDiscountAmountIdr', owned_bill.fixed_discount_amount::text,
            'discountBps', owned_bill.discount_bps,
            'billTaxMode', owned_bill.bill_tax_mode,
            'fixedBillTaxAmountIdr', owned_bill.fixed_bill_tax_amount::text,
            'billTaxBps', owned_bill.bill_tax_bps,
            'serviceChargeBps', owned_bill.service_charge_bps,
            'revision', owned_bill.revision,
            'finalizedAt', owned_bill.finalized_at,
            'archivedAt', owned_bill.archived_at,
            'createdAt', owned_bill.created_at,
            'updatedAt', owned_bill.updated_at,
            'participants', coalesce((
              select jsonb_agg(jsonb_build_object(
                'id', participant.id,
                'name', participant.name,
                'position', participant.position,
                'paymentStatus', participant.payment_status,
                'paidAmountIdr', participant.paid_amount::text,
                'createdAt', participant.created_at,
                'updatedAt', participant.updated_at
              ) order by participant.position, participant.id)
              from split_bill_participants as participant
              where participant.split_bill_id = owned_bill.id
                and participant.user_id = ${userId}
            ), '[]'::jsonb),
            'items', coalesce((
              select jsonb_agg(jsonb_build_object(
                'id', item.id,
                'name', item.name,
                'position', item.position,
                'quantity', item.quantity,
                'unitPriceIdr', item.unit_price::text,
                'itemTaxBps', item.item_tax_bps,
                'createdAt', item.created_at,
                'updatedAt', item.updated_at
              ) order by item.position, item.id)
              from split_bill_items as item
              where item.split_bill_id = owned_bill.id
                and item.user_id = ${userId}
            ), '[]'::jsonb),
            'assignments', coalesce((
              select jsonb_agg(jsonb_build_object(
                'id', assignment.id,
                'itemId', assignment.item_id,
                'participantId', assignment.participant_id,
                'createdAt', assignment.created_at
              ) order by assignment.created_at, assignment.id)
              from split_bill_assignments as assignment
              where assignment.split_bill_id = owned_bill.id
                and assignment.user_id = ${userId}
            ), '[]'::jsonb),
            'calculation', (
              select jsonb_build_object(
                'id', calculation.id,
                'calculationVersion', calculation.calculation_version,
                'sourceRevision', calculation.source_revision,
                'merchantNameSnapshot', calculation.merchant_name_snapshot,
                'billDateSnapshot', calculation.bill_date_snapshot,
                'noteSnapshot', calculation.note_snapshot,
                'discountMode', calculation.discount_mode,
                'fixedDiscountAmountIdr', calculation.fixed_discount_amount::text,
                'discountBps', calculation.discount_bps,
                'billTaxMode', calculation.bill_tax_mode,
                'fixedBillTaxAmountIdr', calculation.fixed_bill_tax_amount::text,
                'billTaxBps', calculation.bill_tax_bps,
                'serviceChargeBps', calculation.service_charge_bps,
                'subtotalAmountIdr', calculation.subtotal_amount::text,
                'discountAmountIdr', calculation.discount_amount::text,
                'discountedSubtotalAmountIdr',
                  calculation.discounted_subtotal_amount::text,
                'itemTaxAmountIdr', calculation.item_tax_amount::text,
                'billTaxAmountIdr', calculation.bill_tax_amount::text,
                'totalTaxAmountIdr', calculation.total_tax_amount::text,
                'serviceChargeAmountIdr',
                  calculation.service_charge_amount::text,
                'finalAmountIdr', calculation.final_amount::text,
                'createdAt', calculation.created_at,
                'itemResults', coalesce((
                  select jsonb_agg(jsonb_build_object(
                    'id', item_result.id,
                    'sourceItemId', item_result.source_item_id,
                    'nameSnapshot', item_result.name_snapshot,
                    'positionSnapshot', item_result.position_snapshot,
                    'quantitySnapshot', item_result.quantity_snapshot,
                    'unitPriceSnapshotIdr',
                      item_result.unit_price_snapshot::text,
                    'itemTaxBpsSnapshot', item_result.item_tax_bps_snapshot,
                    'subtotalAmountIdr', item_result.subtotal_amount::text,
                    'discountAmountIdr', item_result.discount_amount::text,
                    'discountedAmountIdr',
                      item_result.discounted_amount::text,
                    'itemTaxAmountIdr', item_result.item_tax_amount::text,
                    'billTaxAmountIdr', item_result.bill_tax_amount::text,
                    'totalBeforeServiceAmountIdr',
                      item_result.total_before_service_amount::text
                  ) order by item_result.position_snapshot, item_result.id)
                  from split_bill_item_results as item_result
                  where item_result.calculation_id = calculation.id
                    and item_result.user_id = ${userId}
                ), '[]'::jsonb),
                'assignmentResults', coalesce((
                  select jsonb_agg(jsonb_build_object(
                    'id', assignment_result.id,
                    'sourceAssignmentId',
                      assignment_result.source_assignment_id,
                    'sourceItemId', assignment_result.source_item_id,
                    'sourceParticipantId',
                      assignment_result.source_participant_id,
                    'itemAmountIdr', assignment_result.item_amount::text,
                    'itemTaxAmountIdr',
                      assignment_result.item_tax_amount::text,
                    'billTaxAmountIdr',
                      assignment_result.bill_tax_amount::text
                  ) order by assignment_result.created_at, assignment_result.id)
                  from split_bill_assignment_results as assignment_result
                  where assignment_result.calculation_id = calculation.id
                    and assignment_result.user_id = ${userId}
                ), '[]'::jsonb),
                'participantResults', coalesce((
                  select jsonb_agg(jsonb_build_object(
                    'id', participant_result.id,
                    'sourceParticipantId',
                      participant_result.source_participant_id,
                    'nameSnapshot', participant_result.name_snapshot,
                    'positionSnapshot',
                      participant_result.position_snapshot,
                    'itemAmountIdr', participant_result.item_amount::text,
                    'itemTaxAmountIdr',
                      participant_result.item_tax_amount::text,
                    'billTaxAmountIdr',
                      participant_result.bill_tax_amount::text,
                    'serviceChargeAmountIdr',
                      participant_result.service_charge_amount::text,
                    'finalAmountIdr',
                      participant_result.final_amount::text
                  ) order by participant_result.position_snapshot,
                    participant_result.id)
                  from split_bill_participant_results as participant_result
                  where participant_result.calculation_id = calculation.id
                    and participant_result.user_id = ${userId}
                ), '[]'::jsonb)
              )
              from split_bill_calculations as calculation
              where calculation.split_bill_id = owned_bill.id
                and calculation.user_id = ${userId}
            )
          ) order by owned_bill.bill_date, owned_bill.id)
          from split_bills as owned_bill
          where owned_bill.user_id = ${userId}
        ), '[]'::jsonb)
      )
    )::text as backup_json
    from profiles as owned_profile
    where owned_profile.user_id = ${userId}
  `);
  const backup = result.rows[0]?.backup_json;
  if (!backup) throw new Error("User profile not found.");
  return backup;
}

export async function getPersonalDataBackupRecordCount(
  userId: string,
  database: Database = db,
) {
  const result = await database.execute<{ record_count: string }>(sql`
    select (
      (select count(*) from profiles where user_id = ${userId})
      + (select count(*) from accounts where user_id = ${userId})
      + (select count(*) from categories where user_id = ${userId})
      + (select count(*) from transactions where user_id = ${userId})
      + (select count(*) from transfers where user_id = ${userId})
      + (select count(*) from budgets where user_id = ${userId})
      + (select count(*) from recurring_rules where user_id = ${userId})
      + (select count(*) from recurring_generations where user_id = ${userId})
      + (select count(*) from split_bills where user_id = ${userId})
      + (select count(*) from split_bill_participants where user_id = ${userId})
      + (select count(*) from split_bill_items where user_id = ${userId})
      + (select count(*) from split_bill_assignments where user_id = ${userId})
      + (select count(*) from split_bill_calculations where user_id = ${userId})
      + (select count(*) from split_bill_item_results where user_id = ${userId})
      + (select count(*) from split_bill_assignment_results where user_id = ${userId})
      + (select count(*) from split_bill_participant_results where user_id = ${userId})
    )::text as record_count
  `);
  return Number(result.rows[0]?.record_count ?? "0");
}
