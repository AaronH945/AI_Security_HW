/**
 * STARK INDUSTRIES // LAB 04_1 - TOP 5 FEATURE SELECTION INTERACTIVE ENGINE
 * Dataset: 50 Startups | Model: Multiple Linear Regression (OLS)
 */

// Embedded Precomputed Evaluation Data
const DATA = {
  "dataset": {
    "name": "50_Startups",
    "total_samples": 50,
    "train_samples": 40,
    "test_samples": 10,
    "features": [
      "R&D Spend",
      "Administration",
      "Marketing Spend",
      "State_California",
      "State_Florida",
      "State_New York"
    ],
    "target": "Profit",
    "raw_data": [
      {
        "R&D Spend": 165349.2,
        "Administration": 136897.8,
        "Marketing Spend": 471784.1,
        "State": "New York",
        "Profit": 192261.83
      },
      {
        "R&D Spend": 162597.7,
        "Administration": 151377.59,
        "Marketing Spend": 443898.53,
        "State": "California",
        "Profit": 191792.06
      },
      {
        "R&D Spend": 153441.51,
        "Administration": 101145.55,
        "Marketing Spend": 407934.54,
        "State": "Florida",
        "Profit": 191050.39
      },
      {
        "R&D Spend": 144372.41,
        "Administration": 118671.85,
        "Marketing Spend": 383199.62,
        "State": "New York",
        "Profit": 182901.99
      },
      {
        "R&D Spend": 142107.34,
        "Administration": 91391.77,
        "Marketing Spend": 366168.42,
        "State": "Florida",
        "Profit": 166187.94
      },
      {
        "R&D Spend": 131876.9,
        "Administration": 99814.71,
        "Marketing Spend": 362861.36,
        "State": "New York",
        "Profit": 156991.12
      },
      {
        "R&D Spend": 134615.46,
        "Administration": 147198.87,
        "Marketing Spend": 127716.82,
        "State": "California",
        "Profit": 156122.51
      },
      {
        "R&D Spend": 130298.13,
        "Administration": 145530.06,
        "Marketing Spend": 323876.68,
        "State": "Florida",
        "Profit": 155752.6
      },
      {
        "R&D Spend": 120542.52,
        "Administration": 148718.95,
        "Marketing Spend": 311613.29,
        "State": "New York",
        "Profit": 152211.77
      },
      {
        "R&D Spend": 123334.88,
        "Administration": 108679.17,
        "Marketing Spend": 304981.62,
        "State": "California",
        "Profit": 149759.96
      },
      {
        "R&D Spend": 101913.08,
        "Administration": 110594.11,
        "Marketing Spend": 229160.95,
        "State": "Florida",
        "Profit": 146121.95
      },
      {
        "R&D Spend": 100671.96,
        "Administration": 91790.61,
        "Marketing Spend": 249744.55,
        "State": "California",
        "Profit": 144259.4
      },
      {
        "R&D Spend": 93863.75,
        "Administration": 127320.38,
        "Marketing Spend": 249839.44,
        "State": "Florida",
        "Profit": 141585.52
      },
      {
        "R&D Spend": 91992.39,
        "Administration": 135495.07,
        "Marketing Spend": 252664.93,
        "State": "California",
        "Profit": 134307.35
      },
      {
        "R&D Spend": 119943.24,
        "Administration": 156547.42,
        "Marketing Spend": 256512.92,
        "State": "Florida",
        "Profit": 132602.65
      },
      {
        "R&D Spend": 114523.61,
        "Administration": 122616.84,
        "Marketing Spend": 261776.23,
        "State": "New York",
        "Profit": 129917.04
      },
      {
        "R&D Spend": 78013.11,
        "Administration": 121597.55,
        "Marketing Spend": 264346.06,
        "State": "California",
        "Profit": 126992.93
      },
      {
        "R&D Spend": 94657.16,
        "Administration": 145077.58,
        "Marketing Spend": 282574.31,
        "State": "New York",
        "Profit": 125370.37
      },
      {
        "R&D Spend": 91749.16,
        "Administration": 114175.79,
        "Marketing Spend": 294919.57,
        "State": "Florida",
        "Profit": 124266.9
      },
      {
        "R&D Spend": 86419.7,
        "Administration": 153514.11,
        "Marketing Spend": 0.0,
        "State": "New York",
        "Profit": 122776.86
      },
      {
        "R&D Spend": 76253.86,
        "Administration": 113867.3,
        "Marketing Spend": 298664.47,
        "State": "California",
        "Profit": 118474.03
      },
      {
        "R&D Spend": 78389.47,
        "Administration": 153773.43,
        "Marketing Spend": 299737.29,
        "State": "New York",
        "Profit": 111313.02
      },
      {
        "R&D Spend": 73994.56,
        "Administration": 122782.75,
        "Marketing Spend": 303319.26,
        "State": "Florida",
        "Profit": 110352.25
      },
      {
        "R&D Spend": 67532.53,
        "Administration": 105751.03,
        "Marketing Spend": 304768.73,
        "State": "Florida",
        "Profit": 108733.99
      },
      {
        "R&D Spend": 77044.01,
        "Administration": 99281.34,
        "Marketing Spend": 140574.81,
        "State": "New York",
        "Profit": 108552.04
      },
      {
        "R&D Spend": 64664.71,
        "Administration": 139553.16,
        "Marketing Spend": 137962.62,
        "State": "California",
        "Profit": 107404.34
      },
      {
        "R&D Spend": 75328.87,
        "Administration": 144135.98,
        "Marketing Spend": 134050.07,
        "State": "Florida",
        "Profit": 105733.54
      },
      {
        "R&D Spend": 72107.6,
        "Administration": 127864.55,
        "Marketing Spend": 353183.81,
        "State": "New York",
        "Profit": 105008.31
      },
      {
        "R&D Spend": 66051.52,
        "Administration": 182645.56,
        "Marketing Spend": 118148.2,
        "State": "Florida",
        "Profit": 103282.38
      },
      {
        "R&D Spend": 65605.48,
        "Administration": 153032.06,
        "Marketing Spend": 107138.38,
        "State": "New York",
        "Profit": 101004.64
      },
      {
        "R&D Spend": 61994.48,
        "Administration": 115641.28,
        "Marketing Spend": 91131.24,
        "State": "Florida",
        "Profit": 99937.59
      },
      {
        "R&D Spend": 61136.38,
        "Administration": 152701.92,
        "Marketing Spend": 88218.23,
        "State": "New York",
        "Profit": 97483.56
      },
      {
        "R&D Spend": 63408.86,
        "Administration": 129219.61,
        "Marketing Spend": 46085.25,
        "State": "California",
        "Profit": 97427.84
      },
      {
        "R&D Spend": 55493.95,
        "Administration": 103057.49,
        "Marketing Spend": 214634.81,
        "State": "Florida",
        "Profit": 96778.92
      },
      {
        "R&D Spend": 46426.07,
        "Administration": 157693.92,
        "Marketing Spend": 210797.67,
        "State": "California",
        "Profit": 96712.8
      },
      {
        "R&D Spend": 46014.02,
        "Administration": 85047.44,
        "Marketing Spend": 205517.64,
        "State": "New York",
        "Profit": 96479.51
      },
      {
        "R&D Spend": 28663.76,
        "Administration": 127056.21,
        "Marketing Spend": 201126.82,
        "State": "Florida",
        "Profit": 90708.19
      },
      {
        "R&D Spend": 44069.95,
        "Administration": 51283.14,
        "Marketing Spend": 197029.42,
        "State": "California",
        "Profit": 89949.14
      },
      {
        "R&D Spend": 20229.59,
        "Administration": 65947.93,
        "Marketing Spend": 185265.1,
        "State": "New York",
        "Profit": 81229.06
      },
      {
        "R&D Spend": 38558.51,
        "Administration": 82982.09,
        "Marketing Spend": 174999.3,
        "State": "California",
        "Profit": 81005.76
      },
      {
        "R&D Spend": 28754.33,
        "Administration": 118546.05,
        "Marketing Spend": 172795.67,
        "State": "California",
        "Profit": 78239.91
      },
      {
        "R&D Spend": 27892.92,
        "Administration": 84710.77,
        "Marketing Spend": 164470.71,
        "State": "Florida",
        "Profit": 77798.83
      },
      {
        "R&D Spend": 23640.93,
        "Administration": 96189.63,
        "Marketing Spend": 148001.11,
        "State": "California",
        "Profit": 71498.49
      },
      {
        "R&D Spend": 15505.73,
        "Administration": 127382.3,
        "Marketing Spend": 35534.17,
        "State": "New York",
        "Profit": 69758.98
      },
      {
        "R&D Spend": 22177.74,
        "Administration": 154806.14,
        "Marketing Spend": 28334.72,
        "State": "California",
        "Profit": 65200.33
      },
      {
        "R&D Spend": 1000.23,
        "Administration": 124153.04,
        "Marketing Spend": 1903.93,
        "State": "New York",
        "Profit": 64926.08
      },
      {
        "R&D Spend": 1315.46,
        "Administration": 115816.21,
        "Marketing Spend": 297114.46,
        "State": "Florida",
        "Profit": 49490.75
      },
      {
        "R&D Spend": 0.0,
        "Administration": 135426.92,
        "Marketing Spend": 0.0,
        "State": "California",
        "Profit": 42559.73
      },
      {
        "R&D Spend": 542.05,
        "Administration": 51743.15,
        "Marketing Spend": 0.0,
        "State": "New York",
        "Profit": 35673.41
      },
      {
        "R&D Spend": 0.0,
        "Administration": 116983.8,
        "Marketing Spend": 45173.06,
        "State": "California",
        "Profit": 14681.4
      }
    ]
  },
  "methods": {
    "Forward": {
      "info": {
        "name": "Sequential Forward Selection (SFS)",
        "chinese_name": "前向特徵選擇法",
        "type": "Wrapper Method",
        "desc": "由空特徵子集開始，每次迭代利用 5-Fold 交叉驗證挑選使模型預測指標提升最大之單一特徵加入。",
        "complexity": "O(p · k · T)",
        "color": "#00d4ff"
      },
      "steps": [
        {
          "k": 1,
          "features": [
            "R&D Spend"
          ],
          "intercept": 48416.2977,
          "coefficients": {
            "R&D Spend": 0.8516
          },
          "train_rmse": 9493.5806,
          "train_r2": 0.944959,
          "test_rmse": 8274.868,
          "test_r2": 0.946459,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 104667.28,
              "residual": -1384.9
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 134150.83,
              "residual": 10108.57
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 135207.8,
              "residual": 10914.15
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 72170.54,
              "residual": 5628.29
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 179090.59,
              "residual": 11959.8
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 109824.77,
              "residual": -4816.46
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 65644.28,
              "residual": 15584.78
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 100481.43,
              "residual": -2997.87
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 111431.75,
              "residual": -1079.5
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 169438.15,
              "residual": -3250.21
            }
          ]
        },
        {
          "k": 2,
          "features": [
            "R&D Spend",
            "Marketing Spend"
          ],
          "intercept": 46346.3388,
          "coefficients": {
            "R&D Spend": 0.7886,
            "Marketing Spend": 0.0326
          },
          "train_rmse": 9078.6179,
          "train_r2": 0.949665,
          "test_rmse": 8198.7972,
          "test_r2": 0.947439,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 102284.65,
              "residual": 997.73
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 133873.92,
              "residual": 10385.48
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 134182.15,
              "residual": 11939.8
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 73701.11,
              "residual": 4097.72
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 180642.25,
              "residual": 10408.14
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 114717.25,
              "residual": -9708.94
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 68335.08,
              "residual": 12893.98
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 97433.46,
              "residual": 50.1
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 114580.92,
              "residual": -4228.67
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 170343.32,
              "residual": -4155.38
            }
          ]
        },
        {
          "k": 3,
          "features": [
            "R&D Spend",
            "Administration",
            "Marketing Spend"
          ],
          "intercept": 42989.0082,
          "coefficients": {
            "R&D Spend": 0.7788,
            "Administration": 0.0294,
            "Marketing Spend": 0.0347
          },
          "train_rmse": 9052.2672,
          "train_r2": 0.949957,
          "test_rmse": 8803.7758,
          "test_r2": 0.939396,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 103901.9,
              "residual": -619.52
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132763.06,
              "residual": 11496.34
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 133567.9,
              "residual": 12554.05
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 72911.79,
              "residual": 4887.04
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 179627.93,
              "residual": 11422.46
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 115166.65,
              "residual": -10158.34
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67113.58,
              "residual": 14115.48
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98154.81,
              "residual": -671.25
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 114756.12,
              "residual": -4403.87
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 169064.01,
              "residual": -2876.07
            }
          ]
        },
        {
          "k": 4,
          "features": [
            "R&D Spend",
            "Administration",
            "Marketing Spend",
            "State_California"
          ],
          "intercept": 42991.8978,
          "coefficients": {
            "R&D Spend": 0.7788,
            "Administration": 0.0294,
            "Marketing Spend": 0.0347,
            "State_California": -5.7522
          },
          "train_rmse": 9052.2668,
          "train_r2": 0.949957,
          "test_rmse": 8803.6864,
          "test_r2": 0.939397,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 103904.51,
              "residual": -622.13
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132759.25,
              "residual": 11500.15
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 133569.92,
              "residual": 12552.03
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 72914.38,
              "residual": 4884.45
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 179629.25,
              "residual": 11421.14
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 115168.7,
              "residual": -10160.39
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67116.15,
              "residual": 14112.91
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98157.44,
              "residual": -673.88
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 114758.23,
              "residual": -4405.98
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 169065.47,
              "residual": -2877.53
            }
          ]
        },
        {
          "k": 5,
          "features": [
            "R&D Spend",
            "Administration",
            "Marketing Spend",
            "State_California",
            "State_Florida"
          ],
          "intercept": 43253.5367,
          "coefficients": {
            "R&D Spend": 0.7735,
            "Administration": 0.0329,
            "Marketing Spend": 0.0366,
            "State_California": -699.3691,
            "State_Florida": -1658.6532
          },
          "train_rmse": 9031.6666,
          "train_r2": 0.950185,
          "test_rmse": 9137.9902,
          "test_r2": 0.934707,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 103015.2,
              "residual": 267.18
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132582.28,
              "residual": 11677.12
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 132447.74,
              "residual": 13674.21
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 71976.1,
              "residual": 5822.73
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 178537.48,
              "residual": 12512.91
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 116161.24,
              "residual": -11152.93
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67851.69,
              "residual": 13377.37
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98791.73,
              "residual": -1308.17
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 113969.44,
              "residual": -3617.19
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 167921.07,
              "residual": -1733.13
            }
          ]
        },
        {
          "k": 6,
          "features": [
            "R&D Spend",
            "Administration",
            "Marketing Spend",
            "State_California",
            "State_Florida",
            "State_New York"
          ],
          "intercept": 42467.5292,
          "coefficients": {
            "R&D Spend": 0.7735,
            "Administration": 0.0329,
            "Marketing Spend": 0.0366,
            "State_California": 86.6384,
            "State_Florida": -872.6458,
            "State_New York": 786.0074
          },
          "train_rmse": 9031.6666,
          "train_r2": 0.950185,
          "test_rmse": 9137.9902,
          "test_r2": 0.934707,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 103015.2,
              "residual": 267.18
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132582.28,
              "residual": 11677.12
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 132447.74,
              "residual": 13674.21
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 71976.1,
              "residual": 5822.73
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 178537.48,
              "residual": 12512.91
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 116161.24,
              "residual": -11152.93
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67851.69,
              "residual": 13377.37
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98791.73,
              "residual": -1308.17
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 113969.44,
              "residual": -3617.19
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 167921.07,
              "residual": -1733.13
            }
          ]
        }
      ]
    },
    "Backward": {
      "info": {
        "name": "Sequential Backward Selection (SBS)",
        "chinese_name": "後向消除特徵選擇法",
        "type": "Wrapper Method",
        "desc": "由全特徵集合開始，每次迭代評估並移除對模型預測貢獻最低（移除後損失最小）之特徵。",
        "complexity": "O(p · (p - k) · T)",
        "color": "#00e676"
      },
      "steps": [
        {
          "k": 1,
          "features": [
            "R&D Spend"
          ],
          "intercept": 48416.2977,
          "coefficients": {
            "R&D Spend": 0.8516
          },
          "train_rmse": 9493.580597976612,
          "train_r2": 0.9449589778363044,
          "test_rmse": 8274.86801822599,
          "test_r2": 0.9464587607787219,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 104667.28,
              "residual": -1384.9
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 134150.83,
              "residual": 10108.57
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 135207.8,
              "residual": 10914.15
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 72170.54,
              "residual": 5628.29
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 179090.59,
              "residual": 11959.8
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 109824.77,
              "residual": -4816.46
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 65644.28,
              "residual": 15584.78
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 100481.43,
              "residual": -2997.87
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 111431.75,
              "residual": -1079.5
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 169438.15,
              "residual": -3250.21
            }
          ]
        },
        {
          "k": 2,
          "features": [
            "R&D Spend",
            "Marketing Spend"
          ],
          "intercept": 46346.3388,
          "coefficients": {
            "R&D Spend": 0.7886,
            "Marketing Spend": 0.0326
          },
          "train_rmse": 9078.61791848669,
          "train_r2": 0.9496654854268443,
          "test_rmse": 8198.797190788488,
          "test_r2": 0.9474386447268488,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 102284.65,
              "residual": 997.73
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 133873.92,
              "residual": 10385.48
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 134182.15,
              "residual": 11939.8
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 73701.11,
              "residual": 4097.72
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 180642.25,
              "residual": 10408.14
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 114717.25,
              "residual": -9708.94
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 68335.08,
              "residual": 12893.98
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 97433.46,
              "residual": 50.1
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 114580.92,
              "residual": -4228.67
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 170343.32,
              "residual": -4155.38
            }
          ]
        },
        {
          "k": 3,
          "features": [
            "R&D Spend",
            "Marketing Spend",
            "State_New York"
          ],
          "intercept": 46100.2913,
          "coefficients": {
            "R&D Spend": 0.7859,
            "Marketing Spend": 0.0333,
            "State_New York": 864.0019
          },
          "train_rmse": 9069.684820873443,
          "train_r2": 0.9497644921078413,
          "test_rmse": 8309.05968348172,
          "test_r2": 0.9460153830071389,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 101939.27,
              "residual": 1343.11
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 133524.92,
              "residual": 10734.48
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 133815.43,
              "residual": 12306.52
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 73492.77,
              "residual": 4306.06
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 180258.25,
              "residual": 10792.14
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 115382.64,
              "residual": -10374.33
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 69026.25,
              "residual": 12202.81
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 97944.78,
              "residual": -461.22
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 114342.46,
              "residual": -3990.21
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 169961.42,
              "residual": -3773.48
            }
          ]
        },
        {
          "k": 4,
          "features": [
            "R&D Spend",
            "Marketing Spend",
            "State_New York",
            "State_Florida"
          ],
          "intercept": 46329.0602,
          "coefficients": {
            "R&D Spend": 0.7851,
            "Marketing Spend": 0.034,
            "State_Florida": -826.4682,
            "State_New York": 554.6573
          },
          "train_rmse": 9064.118245163727,
          "train_r2": 0.9498261378977877,
          "test_rmse": 8409.916714488054,
          "test_r2": 0.9446968769428332,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 101374.28,
              "residual": 1908.1
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 133851.24,
              "residual": 10408.16
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 133300.28,
              "residual": 12821.67
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 72987.32,
              "residual": 4811.51
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 179827.91,
              "residual": 11222.48
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 115491.25,
              "residual": -10482.94
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 69057.75,
              "residual": 12171.31
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 97880.01,
              "residual": -396.45
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 113898.44,
              "residual": -3546.19
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 169510.76,
              "residual": -3322.82
            }
          ]
        },
        {
          "k": 5,
          "features": [
            "R&D Spend",
            "Marketing Spend",
            "State_New York",
            "State_Florida",
            "State_California"
          ],
          "intercept": 46238.4566,
          "coefficients": {
            "R&D Spend": 0.7851,
            "Marketing Spend": 0.034,
            "State_California": 90.6036,
            "State_Florida": -735.8646,
            "State_New York": 645.2609
          },
          "train_rmse": 9031.666612578969,
          "train_r2": 0.9501847627493607,
          "test_rmse": 9137.99015279461,
          "test_r2": 0.9347068473282473,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 101374.28,
              "residual": 1908.1
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 133851.24,
              "residual": 10408.16
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 133300.28,
              "residual": 12821.67
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 72987.32,
              "residual": 4811.51
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 179827.91,
              "residual": 11222.48
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 115491.25,
              "residual": -10482.94
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 69057.75,
              "residual": 12171.31
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 97880.01,
              "residual": -396.45
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 113898.44,
              "residual": -3546.19
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 169510.76,
              "residual": -3322.82
            }
          ]
        },
        {
          "k": 6,
          "features": [
            "R&D Spend",
            "Administration",
            "Marketing Spend",
            "State_California",
            "State_Florida",
            "State_New York"
          ],
          "intercept": 42467.5292,
          "coefficients": {
            "R&D Spend": 0.7735,
            "Administration": 0.0329,
            "Marketing Spend": 0.0366,
            "State_California": 86.6384,
            "State_Florida": -872.6458,
            "State_New York": 786.0074
          },
          "train_rmse": 9031.6666,
          "train_r2": 0.950185,
          "test_rmse": 9137.9902,
          "test_r2": 0.934707,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 103015.2,
              "residual": 267.18
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132582.28,
              "residual": 11677.12
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 132447.74,
              "residual": 13674.21
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 71976.1,
              "residual": 5822.73
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 178537.48,
              "residual": 12512.91
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 116161.24,
              "residual": -11152.93
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67851.69,
              "residual": 13377.37
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98791.73,
              "residual": -1308.17
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 113969.44,
              "residual": -3617.19
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 167921.07,
              "residual": -1733.13
            }
          ]
        }
      ]
    },
    "RFE": {
      "info": {
        "name": "Recursive Feature Elimination (RFE)",
        "chinese_name": "遞迴特徵消除法",
        "type": "Wrapper / Hybrid",
        "desc": "先將特徵標準化，訓練線性模型後依據係數絕對值大小排序，每次遞迴剪除最小權重特徵。",
        "complexity": "O((p - k) · T)",
        "color": "#b388ff"
      },
      "steps": [
        {
          "k": 1,
          "features": [
            "R&D Spend"
          ],
          "intercept": 48416.2977,
          "coefficients": {
            "R&D Spend": 0.8516
          },
          "train_rmse": 9493.5806,
          "train_r2": 0.944959,
          "test_rmse": 8274.868,
          "test_r2": 0.946459,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 104667.28,
              "residual": -1384.9
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 134150.83,
              "residual": 10108.57
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 135207.8,
              "residual": 10914.15
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 72170.54,
              "residual": 5628.29
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 179090.59,
              "residual": 11959.8
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 109824.77,
              "residual": -4816.46
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 65644.28,
              "residual": 15584.78
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 100481.43,
              "residual": -2997.87
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 111431.75,
              "residual": -1079.5
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 169438.15,
              "residual": -3250.21
            }
          ]
        },
        {
          "k": 2,
          "features": [
            "R&D Spend",
            "Marketing Spend"
          ],
          "intercept": 46346.3388,
          "coefficients": {
            "R&D Spend": 0.7886,
            "Marketing Spend": 0.0326
          },
          "train_rmse": 9078.6179,
          "train_r2": 0.949665,
          "test_rmse": 8198.7972,
          "test_r2": 0.947439,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 102284.65,
              "residual": 997.73
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 133873.92,
              "residual": 10385.48
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 134182.15,
              "residual": 11939.8
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 73701.11,
              "residual": 4097.72
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 180642.25,
              "residual": 10408.14
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 114717.25,
              "residual": -9708.94
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 68335.08,
              "residual": 12893.98
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 97433.46,
              "residual": 50.1
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 114580.92,
              "residual": -4228.67
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 170343.32,
              "residual": -4155.38
            }
          ]
        },
        {
          "k": 3,
          "features": [
            "R&D Spend",
            "Administration",
            "Marketing Spend"
          ],
          "intercept": 42989.0082,
          "coefficients": {
            "R&D Spend": 0.7788,
            "Administration": 0.0294,
            "Marketing Spend": 0.0347
          },
          "train_rmse": 9052.2672,
          "train_r2": 0.949957,
          "test_rmse": 8803.7758,
          "test_r2": 0.939396,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 103901.9,
              "residual": -619.52
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132763.06,
              "residual": 11496.34
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 133567.9,
              "residual": 12554.05
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 72911.79,
              "residual": 4887.04
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 179627.93,
              "residual": 11422.46
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 115166.65,
              "residual": -10158.34
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67113.58,
              "residual": 14115.48
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98154.81,
              "residual": -671.25
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 114756.12,
              "residual": -4403.87
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 169064.01,
              "residual": -2876.07
            }
          ]
        },
        {
          "k": 4,
          "features": [
            "R&D Spend",
            "Administration",
            "Marketing Spend",
            "State_Florida"
          ],
          "intercept": 42922.4323,
          "coefficients": {
            "R&D Spend": 0.7754,
            "Administration": 0.0319,
            "Marketing Spend": 0.0363,
            "State_Florida": -1272.1608
          },
          "train_rmse": 9036.5108,
          "train_r2": 0.950131,
          "test_rmse": 9068.5412,
          "test_r2": 0.935696,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 102978.26,
              "residual": 304.12
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132979.34,
              "residual": 11280.06
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 132521.05,
              "residual": 13600.9
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 71952.39,
              "residual": 5846.44
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 178668.35,
              "residual": 12382.04
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 115738.44,
              "residual": -10730.13
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67439.98,
              "residual": 13789.08
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98397.74,
              "residual": -914.18
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 113956.0,
              "residual": -3603.75
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 168051.97,
              "residual": -1864.03
            }
          ]
        },
        {
          "k": 5,
          "features": [
            "R&D Spend",
            "Administration",
            "Marketing Spend",
            "State_Florida",
            "State_New York"
          ],
          "intercept": 42554.1676,
          "coefficients": {
            "R&D Spend": 0.7735,
            "Administration": 0.0329,
            "Marketing Spend": 0.0366,
            "State_Florida": -959.2842,
            "State_New York": 699.3691
          },
          "train_rmse": 9031.6666,
          "train_r2": 0.950185,
          "test_rmse": 9137.9902,
          "test_r2": 0.934707,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 103015.2,
              "residual": 267.18
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132582.28,
              "residual": 11677.12
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 132447.74,
              "residual": 13674.21
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 71976.1,
              "residual": 5822.73
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 178537.48,
              "residual": 12512.91
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 116161.24,
              "residual": -11152.93
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67851.69,
              "residual": 13377.37
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98791.73,
              "residual": -1308.17
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 113969.44,
              "residual": -3617.19
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 167921.07,
              "residual": -1733.13
            }
          ]
        },
        {
          "k": 6,
          "features": [
            "R&D Spend",
            "Administration",
            "Marketing Spend",
            "State_California",
            "State_Florida",
            "State_New York"
          ],
          "intercept": 42467.5292,
          "coefficients": {
            "R&D Spend": 0.7735,
            "Administration": 0.0329,
            "Marketing Spend": 0.0366,
            "State_California": 86.6384,
            "State_Florida": -872.6458,
            "State_New York": 786.0074
          },
          "train_rmse": 9031.6666,
          "train_r2": 0.950185,
          "test_rmse": 9137.9902,
          "test_r2": 0.934707,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 103015.2,
              "residual": 267.18
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132582.28,
              "residual": 11677.12
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 132447.74,
              "residual": 13674.21
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 71976.1,
              "residual": 5822.73
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 178537.48,
              "residual": 12512.91
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 116161.24,
              "residual": -11152.93
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67851.69,
              "residual": 13377.37
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98791.73,
              "residual": -1308.17
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 113969.44,
              "residual": -3617.19
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 167921.07,
              "residual": -1733.13
            }
          ]
        }
      ]
    },
    "Lasso": {
      "info": {
        "name": "Lasso L1 Regularization (L1 Norm)",
        "chinese_name": "L1 正則化 (Lasso 套索迴歸)",
        "type": "Embedded Method",
        "desc": "在損失函數加入 L1 懲罰項，因 L1 菱形幾何邊緣特徵自然促使非關鍵係數直接收縮至精確為 0。",
        "complexity": "O(p · T)",
        "color": "#ffab00"
      },
      "steps": [
        {
          "k": 1,
          "features": [
            "R&D Spend"
          ],
          "intercept": 48416.2977,
          "coefficients": {
            "R&D Spend": 0.8516
          },
          "train_rmse": 9493.5806,
          "train_r2": 0.944959,
          "test_rmse": 8274.868,
          "test_r2": 0.946459,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 104667.28,
              "residual": -1384.9
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 134150.83,
              "residual": 10108.57
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 135207.8,
              "residual": 10914.15
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 72170.54,
              "residual": 5628.29
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 179090.59,
              "residual": 11959.8
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 109824.77,
              "residual": -4816.46
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 65644.28,
              "residual": 15584.78
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 100481.43,
              "residual": -2997.87
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 111431.75,
              "residual": -1079.5
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 169438.15,
              "residual": -3250.21
            }
          ]
        },
        {
          "k": 2,
          "features": [
            "R&D Spend",
            "Marketing Spend"
          ],
          "intercept": 46346.3388,
          "coefficients": {
            "R&D Spend": 0.7886,
            "Marketing Spend": 0.0326
          },
          "train_rmse": 9078.6179,
          "train_r2": 0.949665,
          "test_rmse": 8198.7972,
          "test_r2": 0.947439,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 102284.65,
              "residual": 997.73
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 133873.92,
              "residual": 10385.48
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 134182.15,
              "residual": 11939.8
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 73701.11,
              "residual": 4097.72
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 180642.25,
              "residual": 10408.14
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 114717.25,
              "residual": -9708.94
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 68335.08,
              "residual": 12893.98
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 97433.46,
              "residual": 50.1
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 114580.92,
              "residual": -4228.67
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 170343.32,
              "residual": -4155.38
            }
          ]
        },
        {
          "k": 3,
          "features": [
            "R&D Spend",
            "Marketing Spend",
            "Administration"
          ],
          "intercept": 42989.0082,
          "coefficients": {
            "R&D Spend": 0.7788,
            "Marketing Spend": 0.0347,
            "Administration": 0.0294
          },
          "train_rmse": 9052.2672,
          "train_r2": 0.949957,
          "test_rmse": 8803.7758,
          "test_r2": 0.939396,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 103901.9,
              "residual": -619.52
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132763.06,
              "residual": 11496.34
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 133567.9,
              "residual": 12554.05
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 72911.79,
              "residual": 4887.04
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 179627.93,
              "residual": 11422.46
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 115166.65,
              "residual": -10158.34
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67113.58,
              "residual": 14115.48
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98154.81,
              "residual": -671.25
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 114756.12,
              "residual": -4403.87
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 169064.01,
              "residual": -2876.07
            }
          ]
        },
        {
          "k": 4,
          "features": [
            "R&D Spend",
            "Marketing Spend",
            "Administration",
            "State_New York"
          ],
          "intercept": 42410.3091,
          "coefficients": {
            "R&D Spend": 0.7747,
            "Marketing Spend": 0.0357,
            "Administration": 0.0318,
            "State_New York": 1052.2199
          },
          "train_rmse": 9039.159,
          "train_r2": 0.950102,
          "test_rmse": 8997.1993,
          "test_r2": 0.936703,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 103615.7,
              "residual": -333.32
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132245.7,
              "residual": 12013.7
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 133070.24,
              "residual": 13051.71
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 72592.46,
              "residual": 5206.37
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 179075.96,
              "residual": 11974.43
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 116014.34,
              "residual": -11006.03
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67853.79,
              "residual": 13375.27
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98837.47,
              "residual": -1353.91
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 114480.26,
              "residual": -4128.01
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 168492.59,
              "residual": -2304.65
            }
          ]
        },
        {
          "k": 5,
          "features": [
            "R&D Spend",
            "Marketing Spend",
            "Administration",
            "State_New York",
            "State_Florida"
          ],
          "intercept": 42554.1676,
          "coefficients": {
            "R&D Spend": 0.7735,
            "Marketing Spend": 0.0366,
            "Administration": 0.0329,
            "State_New York": 699.3691,
            "State_Florida": -959.2842
          },
          "train_rmse": 9031.6666,
          "train_r2": 0.950185,
          "test_rmse": 9137.9902,
          "test_r2": 0.934707,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 103015.2,
              "residual": 267.18
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132582.28,
              "residual": 11677.12
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 132447.74,
              "residual": 13674.21
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 71976.1,
              "residual": 5822.73
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 178537.48,
              "residual": 12512.91
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 116161.24,
              "residual": -11152.93
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67851.69,
              "residual": 13377.37
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98791.73,
              "residual": -1308.17
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 113969.44,
              "residual": -3617.19
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 167921.07,
              "residual": -1733.13
            }
          ]
        },
        {
          "k": 6,
          "features": [
            "R&D Spend",
            "Marketing Spend",
            "Administration",
            "State_New York",
            "State_Florida",
            "State_California"
          ],
          "intercept": 42467.5292,
          "coefficients": {
            "R&D Spend": 0.7735,
            "Marketing Spend": 0.0366,
            "Administration": 0.0329,
            "State_New York": 786.0074,
            "State_Florida": -872.6458,
            "State_California": 86.6384
          },
          "train_rmse": 9031.6666,
          "train_r2": 0.950185,
          "test_rmse": 9137.9902,
          "test_r2": 0.934707,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 103015.2,
              "residual": 267.18
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132582.28,
              "residual": 11677.12
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 132447.74,
              "residual": 13674.21
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 71976.1,
              "residual": 5822.73
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 178537.48,
              "residual": 12512.91
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 116161.24,
              "residual": -11152.93
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67851.69,
              "residual": 13377.37
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98791.73,
              "residual": -1308.17
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 113969.44,
              "residual": -3617.19
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 167921.07,
              "residual": -1733.13
            }
          ]
        }
      ]
    },
    "Correlation": {
      "info": {
        "name": "Pearson Correlation Filter",
        "chinese_name": "皮爾森相關係數過濾法",
        "type": "Filter Method",
        "desc": "計算每個特徵與目標變數 Profit 之單變量相關係數絕對值 |r|，獨立於預測模型快速排序挑選 Top k。",
        "complexity": "O(p · n)",
        "color": "#ff5252"
      },
      "steps": [
        {
          "k": 1,
          "features": [
            "R&D Spend"
          ],
          "intercept": 48416.2977,
          "coefficients": {
            "R&D Spend": 0.8516
          },
          "train_rmse": 9493.5806,
          "train_r2": 0.944959,
          "test_rmse": 8274.868,
          "test_r2": 0.946459,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 104667.28,
              "residual": -1384.9
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 134150.83,
              "residual": 10108.57
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 135207.8,
              "residual": 10914.15
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 72170.54,
              "residual": 5628.29
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 179090.59,
              "residual": 11959.8
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 109824.77,
              "residual": -4816.46
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 65644.28,
              "residual": 15584.78
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 100481.43,
              "residual": -2997.87
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 111431.75,
              "residual": -1079.5
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 169438.15,
              "residual": -3250.21
            }
          ]
        },
        {
          "k": 2,
          "features": [
            "R&D Spend",
            "Marketing Spend"
          ],
          "intercept": 46346.3388,
          "coefficients": {
            "R&D Spend": 0.7886,
            "Marketing Spend": 0.0326
          },
          "train_rmse": 9078.6179,
          "train_r2": 0.949665,
          "test_rmse": 8198.7972,
          "test_r2": 0.947439,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 102284.65,
              "residual": 997.73
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 133873.92,
              "residual": 10385.48
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 134182.15,
              "residual": 11939.8
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 73701.11,
              "residual": 4097.72
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 180642.25,
              "residual": 10408.14
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 114717.25,
              "residual": -9708.94
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 68335.08,
              "residual": 12893.98
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 97433.46,
              "residual": 50.1
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 114580.92,
              "residual": -4228.67
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 170343.32,
              "residual": -4155.38
            }
          ]
        },
        {
          "k": 3,
          "features": [
            "R&D Spend",
            "Marketing Spend",
            "Administration"
          ],
          "intercept": 42989.0082,
          "coefficients": {
            "R&D Spend": 0.7788,
            "Marketing Spend": 0.0347,
            "Administration": 0.0294
          },
          "train_rmse": 9052.2672,
          "train_r2": 0.949957,
          "test_rmse": 8803.7758,
          "test_r2": 0.939396,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 103901.9,
              "residual": -619.52
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132763.06,
              "residual": 11496.34
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 133567.9,
              "residual": 12554.05
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 72911.79,
              "residual": 4887.04
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 179627.93,
              "residual": 11422.46
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 115166.65,
              "residual": -10158.34
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67113.58,
              "residual": 14115.48
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98154.81,
              "residual": -671.25
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 114756.12,
              "residual": -4403.87
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 169064.01,
              "residual": -2876.07
            }
          ]
        },
        {
          "k": 4,
          "features": [
            "R&D Spend",
            "Marketing Spend",
            "Administration",
            "State_California"
          ],
          "intercept": 42991.8978,
          "coefficients": {
            "R&D Spend": 0.7788,
            "Marketing Spend": 0.0347,
            "Administration": 0.0294,
            "State_California": -5.7522
          },
          "train_rmse": 9052.2668,
          "train_r2": 0.949957,
          "test_rmse": 8803.6864,
          "test_r2": 0.939397,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 103904.51,
              "residual": -622.13
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132759.25,
              "residual": 11500.15
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 133569.92,
              "residual": 12552.03
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 72914.38,
              "residual": 4884.45
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 179629.25,
              "residual": 11421.14
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 115168.7,
              "residual": -10160.39
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67116.15,
              "residual": 14112.91
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98157.44,
              "residual": -673.88
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 114758.23,
              "residual": -4405.98
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 169065.47,
              "residual": -2877.53
            }
          ]
        },
        {
          "k": 5,
          "features": [
            "R&D Spend",
            "Marketing Spend",
            "Administration",
            "State_California",
            "State_New York"
          ],
          "intercept": 41594.8835,
          "coefficients": {
            "R&D Spend": 0.7735,
            "Marketing Spend": 0.0366,
            "Administration": 0.0329,
            "State_California": 959.2842,
            "State_New York": 1658.6532
          },
          "train_rmse": 9031.6666,
          "train_r2": 0.950185,
          "test_rmse": 9137.9902,
          "test_r2": 0.934707,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 103015.2,
              "residual": 267.18
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132582.28,
              "residual": 11677.12
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 132447.74,
              "residual": 13674.21
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 71976.1,
              "residual": 5822.73
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 178537.48,
              "residual": 12512.91
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 116161.24,
              "residual": -11152.93
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67851.69,
              "residual": 13377.37
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98791.73,
              "residual": -1308.17
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 113969.44,
              "residual": -3617.19
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 167921.07,
              "residual": -1733.13
            }
          ]
        },
        {
          "k": 6,
          "features": [
            "R&D Spend",
            "Marketing Spend",
            "Administration",
            "State_California",
            "State_New York",
            "State_Florida"
          ],
          "intercept": 42467.5292,
          "coefficients": {
            "R&D Spend": 0.7735,
            "Marketing Spend": 0.0366,
            "Administration": 0.0329,
            "State_California": 86.6384,
            "State_New York": 786.0074,
            "State_Florida": -872.6458
          },
          "train_rmse": 9031.6666,
          "train_r2": 0.950185,
          "test_rmse": 9137.9902,
          "test_r2": 0.934707,
          "test_predictions": [
            {
              "index": 28,
              "actual": 103282.38,
              "predicted": 103015.2,
              "residual": 267.18
            },
            {
              "index": 11,
              "actual": 144259.4,
              "predicted": 132582.28,
              "residual": 11677.12
            },
            {
              "index": 10,
              "actual": 146121.95,
              "predicted": 132447.74,
              "residual": 13674.21
            },
            {
              "index": 41,
              "actual": 77798.83,
              "predicted": 71976.1,
              "residual": 5822.73
            },
            {
              "index": 2,
              "actual": 191050.39,
              "predicted": 178537.48,
              "residual": 12512.91
            },
            {
              "index": 27,
              "actual": 105008.31,
              "predicted": 116161.24,
              "residual": -11152.93
            },
            {
              "index": 38,
              "actual": 81229.06,
              "predicted": 67851.69,
              "residual": 13377.37
            },
            {
              "index": 31,
              "actual": 97483.56,
              "predicted": 98791.73,
              "residual": -1308.17
            },
            {
              "index": 22,
              "actual": 110352.25,
              "predicted": 113969.44,
              "residual": -3617.19
            },
            {
              "index": 4,
              "actual": 166187.94,
              "predicted": 167921.07,
              "residual": -1733.13
            }
          ]
        }
      ]
    }
  }
};

// Application State
const state = {
  method: 'Backward', // Defaults to Backward selection matching notebook reference
  k: 2,               // Defaults to optimal k=2
  compMode: 'rmse',   // 'rmse' | 'r2' | 'dual'
  theme: 'cyan',
  charts: {
    rmseByK: null,
    r2ByK: null,
    coef: null,
    pred: null,
    comp: null
  }
};

// Method Theme Colors
const METHOD_COLORS = {
  Backward: '#38ef7d',    // Emerald
  Forward: '#00f2fe',     // Cyan
  RFE: '#ffd700',         // Gold
  Lasso: '#ff7675',       // Coral
  Correlation: '#a29bfe'  // Lavender
};

// DOM Elements
const elements = {
  methodPills: document.getElementById('method-pills-container'),
  activeMethodTag: document.getElementById('active-method-tag'),
  kSlider: document.getElementById('k-slider'),
  kBadge: document.getElementById('k-display-badge'),
  kPills: document.getElementById('k-pills-container'),
  btnQuickBest: document.getElementById('btn-quick-best'),
  algoBullet: document.getElementById('current-algo-bullet'),
  currentAlgoTitle: document.getElementById('current-algo-title'),
  currentAlgoSubtitle: document.getElementById('current-algo-subtitle'),
  currentKSummary: document.getElementById('current-k-summary-text'),
  chipsContainer: document.getElementById('features-chips-container'),
  progressionTableBody: document.getElementById('progression-table-body'),
  progressionTableTitle: document.getElementById('progression-table-title'),
  titleRmseChart: document.getElementById('title-rmse-chart'),
  titleR2Chart: document.getElementById('title-r2-chart'),
  cardTestRmse: document.getElementById('card-test-rmse'),
  cardTestR2: document.getElementById('card-test-r2'),
  valTestRmse: document.getElementById('val-test-rmse'),
  valTestR2: document.getElementById('val-test-r2'),
  valTrainRmse: document.getElementById('val-train-rmse'),
  valTrainR2: document.getElementById('val-train-r2'),
  formulaDisplay: document.getElementById('formula-display'),
  testPredictionsTable: document.querySelector('#test-predictions-table tbody'),
  compHeader: document.getElementById('comp-chart-header'),
  compTabs: document.querySelectorAll('.chart-tab-btn'),
  comparisonMatrixTable: document.querySelector('#comparison-matrix-table tbody'),
  rawDatasetTable: document.querySelector('#raw-dataset-table tbody')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderMethodPills();
  initEventListeners();
  updateUI();
  renderComparisonSection();
  renderRawDataTable();
});

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('hud_theme') || 'cyan';
  setTheme(savedTheme);

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const theme = e.currentTarget.getAttribute('data-theme');
      setTheme(theme);
    });
  });
}

function setTheme(theme) {
  state.theme = theme;
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('hud_theme', theme);

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
  });

  // Re-render charts with updated theme if needed
  if (state.charts.rmseByK) renderSubplots();
  if (state.charts.coef) renderCoefChart();
  if (state.charts.pred) renderPredChart();
  if (state.charts.comp) renderCompChart();
}

// Render Method Pills
function renderMethodPills() {
  const methods = Object.keys(DATA.methods);
  elements.methodPills.innerHTML = methods.map(key => {
    const info = DATA.methods[key].info;
    const isActive = key === state.method;
    const color = METHOD_COLORS[key] || '#00d4ff';
    return `
      <button class="method-pill ${isActive ? 'active' : ''}" data-method="${key}" style="--pill-color:${color};">
        <span class="pill-dot"></span>
        <span class="pill-name">${info.chinese_name}</span>
        <span class="pill-sub">(${key})</span>
      </button>
    `;
  }).join('');

  elements.methodPills.querySelectorAll('.method-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const method = e.currentTarget.getAttribute('data-method');
      setMethod(method);
    });
  });
}

function setMethod(method) {
  if (state.method === method) return;
  state.method = method;

  elements.methodPills.querySelectorAll('.method-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-method') === method);
  });

  const info = DATA.methods[method].info;
  elements.activeMethodTag.textContent = `${info.chinese_name.toUpperCase()} (${method.toUpperCase()})`;
  elements.algoBullet.style.background = METHOD_COLORS[method];
  elements.algoBullet.style.boxShadow = `0 0 10px ${METHOD_COLORS[method]}`;

  updateUI();
}

function setFeatureCount(k) {
  k = parseInt(k, 10);
  if (state.k === k) return;
  state.k = k;
  elements.kSlider.value = k;
  elements.kBadge.textContent = k;

  elements.kPills.querySelectorAll('.k-pill').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.getAttribute('data-k'), 10) === k);
  });

  updateUI();
}

// Event Listeners
function initEventListeners() {
  elements.kSlider.addEventListener('input', (e) => {
    setFeatureCount(e.target.value);
  });

  elements.kPills.querySelectorAll('.k-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const k = e.currentTarget.getAttribute('data-k');
      setFeatureCount(k);
    });
  });

  if (elements.btnQuickBest) {
    elements.btnQuickBest.addEventListener('click', () => {
      setFeatureCount(2);
    });
  }

  // Cross comparison tabs
  elements.compTabs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      elements.compTabs.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      state.compMode = e.currentTarget.getAttribute('data-comp-mode');
      renderCompChart();
    });
  });
}

// Master UI Update
function updateUI() {
  const methodData = DATA.methods[state.method];
  const step = methodData.steps.find(s => s.k === state.k) || methodData.steps[1];

  // Update Summary Header
  elements.currentAlgoTitle.textContent = `${methodData.info.name} (${methodData.info.chinese_name})`;
  elements.currentAlgoTitle.style.color = METHOD_COLORS[state.method];
  elements.currentAlgoSubtitle.textContent = `[${methodData.info.type}] · ${methodData.info.complexity}`;
  elements.currentKSummary.textContent = `當前選取特徵數: ${step.k} / ${DATA.dataset.features.length} 欄位`;

  // Render Feature Chips
  renderChips(step.features);

  // Render Notebook Subplots (RMSE & R-squared by Number of Features)
  renderSubplots();

  // Render Progression Table (Matches Notebook Table)
  renderProgressionTable();

  // Render Telemetry & Cards
  renderTelemetry(step);

  // Render Coefficients & Residuals
  renderCoefChart();
  renderPredChart();
}

// Render Feature Chips
function renderChips(selectedFeatures) {
  const allFeatures = DATA.dataset.features;
  elements.chipsContainer.innerHTML = allFeatures.map(feat => {
    const isSel = selectedFeatures.includes(feat);
    return `
      <div class="feature-chip ${isSel ? 'selected' : 'unselected'}">
        <span class="chip-status">${isSel ? '✔' : '○'}</span>
        <span class="chip-label">${feat}</span>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// 1. Dual Subplots (Exact match to notebook Image 2)
// ==========================================================================
function renderSubplots() {
  const canvasRmse = document.getElementById('chart-rmse-by-features');
  const canvasR2 = document.getElementById('chart-r2-by-features');
  if (!canvasRmse || !canvasR2) return;

  const ctxRmse = canvasRmse.getContext('2d');
  const ctxR2 = canvasR2.getContext('2d');

  const steps = DATA.methods[state.method].steps;
  const kLabels = steps.map(s => s.k);
  const color = METHOD_COLORS[state.method] || '#00d4ff';

  // Subplot 1: RMSE by Number of Features
  if (state.charts.rmseByK) {
    state.charts.rmseByK.destroy();
  }

  const rmseData = steps.map(s => s.test_rmse);
  const pointRadiiRmse = steps.map(s => (s.k === state.k ? 9 : 5));
  const pointColorsRmse = steps.map(s => (s.k === state.k ? '#ffd700' : color));

  state.charts.rmseByK = new Chart(ctxRmse, {
    type: 'line',
    data: {
      labels: kLabels,
      datasets: [{
        label: 'RMSE',
        data: rmseData,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2.2,
        pointRadius: pointRadiiRmse,
        pointHoverRadius: 10,
        pointBackgroundColor: pointColorsRmse,
        pointBorderColor: '#ffffff',
        pointBorderWidth: steps.map(s => (s.k === state.k ? 2 : 1)),
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'RMSE by Number of Features',
          color: '#ffffff',
          font: { family: 'Outfit', size: 14, weight: '600' },
          padding: { bottom: 12 }
        },
        tooltip: {
          callbacks: {
            title: (items) => `Number of Features: ${items[0].label}`,
            label: (ctx) => `RMSE: ${ctx.raw.toFixed(6)}`
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Number of Features',
            color: '#8fa5c4',
            font: { family: 'Outfit', size: 12, weight: '500' }
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#8fa5c4', font: { family: 'JetBrains Mono', size: 11 } }
        },
        y: {
          title: {
            display: true,
            text: 'RMSE',
            color: '#8fa5c4',
            font: { family: 'Outfit', size: 12, weight: '500' }
          },
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          ticks: {
            color: '#8fa5c4',
            font: { family: 'JetBrains Mono', size: 10 },
            callback: (v) => v.toFixed(0)
          }
        }
      }
    }
  });

  // Subplot 2: R-squared by Number of Features
  if (state.charts.r2ByK) {
    state.charts.r2ByK.destroy();
  }

  const r2Data = steps.map(s => s.test_r2);
  const pointRadiiR2 = steps.map(s => (s.k === state.k ? 9 : 5));
  const pointColorsR2 = steps.map(s => (s.k === state.k ? '#ffd700' : color));

  state.charts.r2ByK = new Chart(ctxR2, {
    type: 'line',
    data: {
      labels: kLabels,
      datasets: [{
        label: 'R-squared',
        data: r2Data,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2.2,
        pointRadius: pointRadiiR2,
        pointHoverRadius: 10,
        pointBackgroundColor: pointColorsR2,
        pointBorderColor: '#ffffff',
        pointBorderWidth: steps.map(s => (s.k === state.k ? 2 : 1)),
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'R-squared by Number of Features',
          color: '#ffffff',
          font: { family: 'Outfit', size: 14, weight: '600' },
          padding: { bottom: 12 }
        },
        tooltip: {
          callbacks: {
            title: (items) => `Number of Features: ${items[0].label}`,
            label: (ctx) => `R-squared: ${ctx.raw.toFixed(6)}`
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Number of Features',
            color: '#8fa5c4',
            font: { family: 'Outfit', size: 12, weight: '500' }
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#8fa5c4', font: { family: 'JetBrains Mono', size: 11 } }
        },
        y: {
          title: {
            display: true,
            text: 'R-squared',
            color: '#8fa5c4',
            font: { family: 'Outfit', size: 12, weight: '500' }
          },
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          ticks: {
            color: '#8fa5c4',
            font: { family: 'JetBrains Mono', size: 10 },
            callback: (v) => v.toFixed(3)
          }
        }
      }
    }
  });
}

// ==========================================================================
// 2. Progression Table (Exact match to notebook Image 1)
// ==========================================================================
function renderProgressionTable() {
  const steps = DATA.methods[state.method].steps;
  elements.progressionTableTitle.textContent = `${DATA.methods[state.method].info.chinese_name} · 特徵篩選步階評估表`;

  elements.progressionTableBody.innerHTML = steps.map(s => {
    const isActive = s.k === state.k;
    const isOptimal = s.k === 2;
    const featsStr = '[' + s.features.join(', ') + ']';

    return `
      <tr class="${isActive ? 'active-k-row' : ''} ${isOptimal ? 'optimal-row' : ''}" data-k="${s.k}">
        <td>
          <strong>${s.k}</strong>
          ${isActive ? '<span style="color:var(--primary); font-size:0.75rem; margin-left:6px;">◄ 當前選取</span>' : ''}
          ${isOptimal ? '<span style="color:var(--accent); font-size:0.75rem; margin-left:6px;">⭐ (最佳)</span>' : ''}
        </td>
        <td><code style="color:var(--text-main); font-family:var(--font-mono); font-size:0.82rem;">${featsStr}</code></td>
        <td class="num-cell" style="color:${isActive ? 'var(--primary)' : 'var(--text-main)'}; font-weight:${isActive ? '700' : '400'};">
          ${s.test_rmse.toFixed(6)}
        </td>
        <td class="num-cell" style="color:${isActive ? 'var(--primary)' : 'var(--text-main)'}; font-weight:${isActive ? '700' : '400'};">
          ${s.test_r2.toFixed(6)}
        </td>
      </tr>
    `;
  }).join('');

  // Row click listeners to switch k
  elements.progressionTableBody.querySelectorAll('tr').forEach(row => {
    row.addEventListener('click', (e) => {
      const k = e.currentTarget.getAttribute('data-k');
      setFeatureCount(k);
    });
  });
}

// Telemetry & Cards Update
function renderTelemetry(step) {
  elements.valTestRmse.textContent = step.test_rmse.toFixed(2);
  elements.valTestR2.textContent = (step.test_r2 * 100).toFixed(2) + '%';
  elements.valTrainRmse.textContent = step.train_rmse.toFixed(2);
  elements.valTrainR2.textContent = (step.train_r2 * 100).toFixed(2) + '%';

  // Highlight if k === 2 (Optimal)
  const isOptimal = state.k === 2;
  elements.cardTestRmse.classList.toggle('optimal', isOptimal);
  elements.cardTestR2.classList.toggle('optimal', isOptimal);

  // Render Mathematical Equation
  const terms = Object.entries(step.coefficients).map(([feat, coef]) => {
    const sign = coef >= 0 ? '+' : '-';
    return `${sign} ${Math.abs(coef).toFixed(4)} × <code>[${feat}]</code>`;
  }).join(' ');
  const interceptSign = step.intercept >= 0 ? '' : '-';
  elements.formulaDisplay.innerHTML = `
    <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">多元線性迴歸模型擬合方程式 (Fitted OLS Formula):</div>
    <strong>Profit ($)</strong> = ${interceptSign}$${Math.abs(step.intercept).toFixed(2)} ${terms}
  `;

  // Render Predictions Table
  elements.testPredictionsTable.innerHTML = step.test_predictions.map((rec) => {
    const errPct = Math.abs((rec.residual / rec.actual) * 100).toFixed(2);
    const isAccurate = errPct < 6.0;
    const badgeColor = isAccurate ? 'var(--accent)' : 'var(--text-muted)';
    return `
      <tr>
        <td><strong>#${rec.index}</strong></td>
        <td>$${rec.actual.toLocaleString()}</td>
        <td>$${rec.predicted.toLocaleString()}</td>
        <td style="color:${rec.residual >= 0 ? '#38ef7d' : '#ff5252'};">
          ${rec.residual >= 0 ? '+' : ''}$${rec.residual.toLocaleString()}
        </td>
        <td>${errPct}%</td>
        <td><span style="color:${badgeColor}; font-weight:700;">${isAccurate ? '★ 精準擬合' : '✓ 正常殘差'}</span></td>
      </tr>
    `;
  }).join('');
}

// Chart: Feature Weights (Coefficients)
function renderCoefChart() {
  const canvas = document.getElementById('chart-coefs');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const step = DATA.methods[state.method].steps.find(s => s.k === state.k);
  const color = METHOD_COLORS[state.method];

  const labels = Object.keys(step.coefficients);
  const values = Object.values(step.coefficients);

  if (state.charts.coef) {
    state.charts.coef.destroy();
  }

  state.charts.coef = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '迴歸係數 (β Weight)',
        data: values,
        backgroundColor: values.map(v => v >= 0 ? color + 'cc' : '#ff5252cc'),
        borderColor: values.map(v => v >= 0 ? color : '#ff5252'),
        borderWidth: 1.5,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `係數權重: ${ctx.raw.toFixed(4)}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#8fa5c4', font: { family: 'JetBrains Mono', size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          ticks: { color: '#8fa5c4', font: { family: 'JetBrains Mono' } }
        }
      }
    }
  });
}

// Chart: Test Set Actual vs Predicted
function renderPredChart() {
  const canvas = document.getElementById('chart-predictions');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const step = DATA.methods[state.method].steps.find(s => s.k === state.k);
  const color = METHOD_COLORS[state.method];

  const labels = step.test_predictions.map(p => `#${p.index}`);
  const actuals = step.test_predictions.map(p => p.actual);
  const predicteds = step.test_predictions.map(p => p.predicted);

  if (state.charts.pred) {
    state.charts.pred.destroy();
  }

  state.charts.pred = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '實際值 (Actual Profit)',
          data: actuals,
          borderColor: '#ffffff',
          backgroundColor: '#ffffff',
          borderWidth: 2,
          pointRadius: 5,
          tension: 0.2
        },
        {
          label: `預測值 (${DATA.methods[state.method].info.chinese_name})`,
          data: predicteds,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 5,
          pointStyle: 'rectRot',
          tension: 0.2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#f0f6fc', font: { family: 'Outfit', size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: $${ctx.raw.toLocaleString()}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#8fa5c4', font: { family: 'JetBrains Mono' } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          ticks: {
            color: '#8fa5c4',
            font: { family: 'JetBrains Mono' },
            callback: (v) => '$' + (v / 1000).toFixed(0) + 'k'
          }
        }
      }
    }
  });
}

// ==========================================================================
// 3. Cross Comparison across all 5 methods
// ==========================================================================
function renderComparisonSection() {
  renderCompChart();
  renderCompTable();
}

function renderCompChart() {
  const canvas = document.getElementById('chart-comparison');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const kLabels = [1, 2, 3, 4, 5, 6].map(k => `k = ${k}`);
  const methods = Object.keys(DATA.methods);

  if (state.charts.comp) {
    state.charts.comp.destroy();
  }

  if (state.compMode === 'rmse') {
    elements.compHeader.textContent = '📊 5 FEATURE SELECTION ALGORITHMS: RMSE VS NUMBER OF FEATURES (越低越好)';

    const datasets = methods.map(mKey => {
      const color = METHOD_COLORS[mKey];
      return {
        label: `${DATA.methods[mKey].info.chinese_name} (${mKey})`,
        data: DATA.methods[mKey].steps.map(s => s.test_rmse),
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2.5,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.2
      };
    });

    state.charts.comp = new Chart(ctx, {
      type: 'line',
      data: { labels: kLabels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#f0f6fc', font: { family: 'Outfit', size: 12 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: RMSE = $${ctx.raw.toFixed(2)}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#8fa5c4', font: { family: 'JetBrains Mono', size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            ticks: {
              color: '#8fa5c4',
              font: { family: 'JetBrains Mono' },
              callback: (v) => '$' + v.toFixed(0)
            }
          }
        }
      }
    });
  } else if (state.compMode === 'r2') {
    elements.compHeader.textContent = '📊 5 FEATURE SELECTION ALGORITHMS: R-SQUARED (R²) VS NUMBER OF FEATURES (越高越好)';

    const datasets = methods.map(mKey => {
      const color = METHOD_COLORS[mKey];
      return {
        label: `${DATA.methods[mKey].info.chinese_name} (${mKey})`,
        data: DATA.methods[mKey].steps.map(s => (s.test_r2 * 100)),
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2.5,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.2
      };
    });

    state.charts.comp = new Chart(ctx, {
      type: 'line',
      data: { labels: kLabels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#f0f6fc', font: { family: 'Outfit', size: 12 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: R² = ${ctx.raw.toFixed(2)}%`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#8fa5c4', font: { family: 'JetBrains Mono', size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            ticks: {
              color: '#8fa5c4',
              font: { family: 'JetBrains Mono' },
              callback: (v) => v.toFixed(1) + '%'
            }
          }
        }
      }
    });
  } else {
    // Dual View: Forward & Backward on dual axes
    elements.compHeader.textContent = '📊 5 FEATURE SELECTION ALGORITHMS: DUAL AXIS METRIC VIEW (RMSE vs R²)';

    const datasets = [
      {
        label: 'Forward RMSE (Left Axis)',
        data: DATA.methods.Forward.steps.map(s => s.test_rmse),
        borderColor: '#00f2fe',
        backgroundColor: '#00f2fe',
        yAxisID: 'y',
        borderWidth: 2.5,
        pointRadius: 5
      },
      {
        label: 'Backward RMSE (Left Axis)',
        data: DATA.methods.Backward.steps.map(s => s.test_rmse),
        borderColor: '#38ef7d',
        backgroundColor: '#38ef7d',
        yAxisID: 'y',
        borderWidth: 2.5,
        pointRadius: 5
      },
      {
        label: 'Forward R² % (Right Axis)',
        data: DATA.methods.Forward.steps.map(s => s.test_r2 * 100),
        borderColor: '#ffd700',
        backgroundColor: '#ffd700',
        borderDash: [5, 5],
        yAxisID: 'y1',
        borderWidth: 2,
        pointRadius: 5
      },
      {
        label: 'Backward R² % (Right Axis)',
        data: DATA.methods.Backward.steps.map(s => s.test_r2 * 100),
        borderColor: '#ff5252',
        backgroundColor: '#ff5252',
        borderDash: [5, 5],
        yAxisID: 'y1',
        borderWidth: 2,
        pointRadius: 5
      }
    ];

    state.charts.comp = new Chart(ctx, {
      type: 'line',
      data: { labels: kLabels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#f0f6fc', font: { family: 'Outfit', size: 12 } } }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#8fa5c4', font: { family: 'JetBrains Mono' } }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'RMSE (Test)', color: '#00f2fe' },
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            ticks: { color: '#8fa5c4' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'R-squared (%)', color: '#ffd700' },
            grid: { drawOnChartArea: false },
            ticks: { color: '#ffd700' }
          }
        }
      }
    });
  }
}

// Render Comparison Matrix Table
function renderCompTable() {
  const kRange = [1, 2, 3, 4, 5, 6];

  elements.comparisonMatrixTable.innerHTML = kRange.map(k => {
    const fwd = DATA.methods.Forward.steps[k - 1];
    const bwd = DATA.methods.Backward.steps[k - 1];
    const rfe = DATA.methods.RFE.steps[k - 1];
    const lasso = DATA.methods.Lasso.steps[k - 1];
    const corr = DATA.methods.Correlation.steps[k - 1];

    const rmses = [
      { m: 'Backward', v: bwd.test_rmse, r2: bwd.test_r2 },
      { m: 'Forward', v: fwd.test_rmse, r2: fwd.test_r2 },
      { m: 'RFE', v: rfe.test_rmse, r2: rfe.test_r2 },
      { m: 'Lasso', v: lasso.test_rmse, r2: lasso.test_r2 },
      { m: 'Correlation', v: corr.test_rmse, r2: corr.test_r2 }
    ];

    rmses.sort((a, b) => a.v - b.v);
    const best = rmses[0];

    const isGlobalBest = k === 2;

    return `
      <tr class="${isGlobalBest ? 'highlight-row' : ''}">
        <td><strong>k = ${k}</strong> ${isGlobalBest ? '⭐ (最佳)' : ''}</td>
        <td>${bwd.test_rmse.toFixed(2)} / ${(bwd.test_r2 * 100).toFixed(2)}%</td>
        <td>${fwd.test_rmse.toFixed(2)} / ${(fwd.test_r2 * 100).toFixed(2)}%</td>
        <td>${rfe.test_rmse.toFixed(2)} / ${(rfe.test_r2 * 100).toFixed(2)}%</td>
        <td>${lasso.test_rmse.toFixed(2)} / ${(lasso.test_r2 * 100).toFixed(2)}%</td>
        <td>${corr.test_rmse.toFixed(2)} / ${(corr.test_r2 * 100).toFixed(2)}%</td>
        <td><span class="score-badge-best">${best.m} (RMSE ${best.v.toFixed(2)})</span></td>
      </tr>
    `;
  }).join('');
}

// Render Raw Dataset Table
function renderRawDataTable() {
  const raw = DATA.dataset.raw_data;
  elements.rawDatasetTable.innerHTML = raw.map((r, i) => {
    return `
      <tr>
        <td>${i + 1}</td>
        <td>$${r['R&D Spend'].toLocaleString()}</td>
        <td>$${r['Administration'].toLocaleString()}</td>
        <td>$${r['Marketing Spend'].toLocaleString()}</td>
        <td><span style="color:var(--primary);">${r['State']}</span></td>
        <td style="color:var(--accent); font-weight:700;">$${r['Profit'].toLocaleString()}</td>
      </tr>
    `;
  }).join('');
}
