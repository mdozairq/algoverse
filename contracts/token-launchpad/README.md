# Token Launchpad Smart Contracts

This directory contains smart contracts for managing marketplace token launchpads, liquidity pools, and automated trading rules on Algorand.

## Contracts Overview

### 1. Token Liquidity Pool Manager (`liquidity-pool-manager.teal`)
Manages liquidity pools for marketplace tokens across multiple DEXs (Tinyman V2, Pact Finance).

### 2. Automated Trading Rules (`trading-rules-automation.teal`)
Implements automated trading strategies including DCA (Dollar Cost Averaging), rebalancing, and asset rotation.

## Token Liquidity Pool Manager

### Overview
Manages liquidity pool creation, updates, and monitoring for marketplace tokens. Supports multiple DEX integrations.

### Global State
- `token_asset_id` (uint64): The ASA ID of the marketplace token
- `platform_address` (bytes): Platform wallet address
- `tinyman_pool_id` (uint64): Tinyman V2 pool ID (0 if not created)
- `pact_pool_id` (uint64): Pact Finance pool ID (0 if not created)
- `total_liquidity` (uint64): Total liquidity provided (in microAlgos)
- `token_reserve` (uint64): Token reserve amount
- `algo_reserve` (uint64): ALGO reserve amount
- `status` (uint64): Pool status (0=pending, 1=active, 2=paused)

### Methods

#### 1. `init` - Initialize Pool Manager
Initializes the contract for a specific token.

**Arguments:**
- `token_asset_id`: The ASA ID of the marketplace token
- `platform_address`: Platform wallet address (32 bytes)

#### 2. `register_pool` - Register DEX Pool
Registers a liquidity pool from a DEX.

**Arguments:**
- `dex_type`: DEX type (0=Tinyman, 1=Pact)
- `pool_id`: Pool ID from the DEX
- `pool_address`: Pool address (32 bytes)

**Transaction Group:**
- Transaction 0: Application call
- Transaction 1: Asset opt-in (if needed)

#### 3. `update_reserves` - Update Pool Reserves
Updates the reserve amounts for a pool.

**Arguments:**
- `dex_type`: DEX type (0=Tinyman, 1=Pact)
- `token_reserve`: Current token reserve
- `algo_reserve`: Current ALGO reserve

#### 4. `get_pool_status` - Get Pool Status
Read-only method that returns pool status via logs.

**Returns (via logs):**
- token_asset_id
- tinyman_pool_id
- pact_pool_id
- total_liquidity
- token_reserve
- algo_reserve
- status

## Automated Trading Rules Contract

### Overview
Implements automated trading strategies for marketplace tokens including DCA, rebalancing, and rotation.

### Global State
- `token_asset_id` (uint64): The ASA ID of the marketplace token
- `platform_address` (bytes): Platform wallet address
- `rule_type` (uint64): Rule type (0=DCA, 1=Rebalancing, 2=Rotation)
- `enabled` (uint64): Whether the rule is enabled (0=disabled, 1=enabled)
- `last_executed` (uint64): Timestamp of last execution
- `execution_count` (uint64): Number of times executed
- `next_execution` (uint64): Timestamp for next execution

### DCA-Specific State
- `interval_hours` (uint64): DCA interval in hours
- `amount_per_interval` (uint64): Amount to trade per interval (in microAlgos)
- `target_price` (uint64): Target price in microAlgos (optional, 0 = no target)

### Rebalancing-Specific State
- `target_allocation` (uint64): Target allocation percentage (0-100)
- `threshold_percentage` (uint64): Deviation threshold before rebalancing (0-100)
- `current_allocation` (uint64): Current allocation percentage

### Rotation-Specific State
- `strategy_type` (uint64): Strategy type (0=performance, 1=time, 2=volume)
- `rotation_period` (uint64): Rotation period in seconds
- `min_performance` (uint64): Minimum performance threshold

### Methods

#### 1. `init` - Initialize Trading Rule
Initializes a trading rule contract.

**Arguments:**
- `token_asset_id`: The ASA ID of the marketplace token
- `platform_address`: Platform wallet address (32 bytes)
- `rule_type`: Rule type (0=DCA, 1=Rebalancing, 2=Rotation)

#### 2. `configure_dca` - Configure DCA Rule
Configures DCA-specific parameters.

**Arguments:**
- `interval_hours`: DCA interval in hours
- `amount_per_interval`: Amount to trade per interval (in microAlgos)
- `target_price`: Target price in microAlgos (0 = no target)

#### 3. `configure_rebalancing` - Configure Rebalancing Rule
Configures rebalancing-specific parameters.

**Arguments:**
- `target_allocation`: Target allocation percentage (0-100)
- `threshold_percentage`: Deviation threshold (0-100)

#### 4. `configure_rotation` - Configure Rotation Rule
Configures rotation-specific parameters.

**Arguments:**
- `strategy_type`: Strategy type (0=performance, 1=time, 2=volume)
- `rotation_period`: Rotation period in seconds
- `min_performance`: Minimum performance threshold

#### 5. `execute_rule` - Execute Trading Rule
Executes the configured trading rule.

**Transaction Group:**
- Transaction 0: Application call
- Transaction 1-N: Trading transactions (swaps, transfers, etc.)

#### 6. `enable` / `disable` - Enable/Disable Rule
Enables or disables the trading rule.

#### 7. `get_status` - Get Rule Status
Read-only method that returns rule status via logs.

## Deployment

### Token Liquidity Pool Manager

```bash
goal app create \
  --approval-prog liquidity-pool-manager/approval.teal \
  --clear-prog liquidity-pool-manager/clear.teal \
  --global-byteslices 1 \
  --global-ints 7 \
  --local-byteslices 0 \
  --local-ints 0 \
  --app-arg int:TOKEN_ASSET_ID \
  --app-arg addr:PLATFORM_ADDRESS \
  --from CREATOR_ADDRESS
```

### Automated Trading Rules

```bash
goal app create \
  --approval-prog trading-rules-automation/approval.teal \
  --clear-prog trading-rules-automation/clear.teal \
  --global-byteslices 1 \
  --global-ints 10 \
  --local-byteslices 0 \
  --local-ints 0 \
  --app-arg int:TOKEN_ASSET_ID \
  --app-arg addr:PLATFORM_ADDRESS \
  --app-arg int:RULE_TYPE \
  --from CREATOR_ADDRESS
```

## Security Considerations

- All contracts require platform address verification
- State changes are atomic via transaction groups
- Time-based rules prevent execution abuse
- Reserve updates require proper authorization
- Trading rules can be paused/enabled by authorized addresses

## Integration

These contracts integrate with:
- **Multi-DEX Aggregator**: For finding optimal swap routes
- **Tinyman V2 SDK**: For Tinyman pool interactions
- **Pact Finance SDK**: For Pact pool interactions (when available)
- **Trading Rules Executor Service**: Background service for automated execution

