/**
 * 决策人格谱 V1 (5/18 ship · 用户拍板设计)
 *
 * 设计原则:
 *   - 不诊断 (vs 临床类型学), 不评价 (vs MBTI 评好坏)
 *   - 只讲 "决策习惯", 不扩展到全 personality
 *   - 必须 ground 在 onboarding 答案具体语句, 反幻觉
 *   - 可以进化 (随用户多次决策, 自动 drift 检测)
 *
 * 6 主型 (覆盖光谱, 不强制对号入座):
 *   - 价值锚:  奠基者 (Foundation)
 *   - 路径锚:  制图者 (Cartographer)
 *   - 关系锚:  织网者 (Connector)
 *   - 当下锚:  应变者 (Adaptor)
 *   - 异见锚:  逆行者 (Contrarian)
 *   - 综合锚:  整合者 (Integrator)
 */

export type DecisionPersonalityType =
  | 'foundation'   // 奠基者
  | 'cartographer' // 制图者
  | 'connector'    // 织网者
  | 'adaptor'      // 应变者
  | 'contrarian'   // 逆行者
  | 'integrator';  // 整合者

export interface PersonalityTypeMeta {
  id: DecisionPersonalityType;
  name: string;       // "奠基者"
  nameEn: string;     // "Foundation"
  anchor: string;     // "价值"
  oneLiner: string;   // 一句话定义
}

export const PERSONALITY_TYPES: Record<DecisionPersonalityType, PersonalityTypeMeta> = {
  foundation: {
    id: 'foundation',
    name: '奠基者',
    nameEn: 'Foundation',
    anchor: '价值',
    oneLiner: '决策从核心价值出发, 不易摇摆.',
  },
  cartographer: {
    id: 'cartographer',
    name: '制图者',
    nameEn: 'Cartographer',
    anchor: '路径',
    oneLiner: '决策建立在长远图景上, 系统视角.',
  },
  connector: {
    id: 'connector',
    name: '织网者',
    nameEn: 'Connector',
    anchor: '关系',
    oneLiner: '决策考虑关系网络, 多方平衡.',
  },
  adaptor: {
    id: 'adaptor',
    name: '应变者',
    nameEn: 'Adaptor',
    anchor: '当下',
    oneLiner: '决策跟随当下信号, 灵活快速.',
  },
  contrarian: {
    id: 'contrarian',
    name: '逆行者',
    nameEn: 'Contrarian',
    anchor: '异见',
    oneLiner: '决策反主流, 独立判断.',
  },
  integrator: {
    id: 'integrator',
    name: '整合者',
    nameEn: 'Integrator',
    anchor: '综合',
    oneLiner: '决策综合多源信息, 慢但全面.',
  },
};

/**
 * LLM 生成的人格画像 · 必须 ground 在用户实际 onboarding 答案
 */
export interface DecisionPersonality {
  /** 主型 */
  type: DecisionPersonalityType;
  /** 个性化 headline · 30-60 字 · 把 type 跟 user 具体处境结合 */
  headline: string;
  /** 3 个决策签名 · 每个必须引用 onboarding 答案具体证据 */
  signatures: Array<{
    pattern: string;          // 1 句话描述 (15-30 字)
    evidence: string;         // 来自 onboarding 哪段 (verbatim 或紧贴)
    sourceStage: string;      // 'values' | 'life-events' 等
  }>;
  /** 1 个盲点 · 给"你可能没看到的事" */
  blindSpot: {
    description: string;      // 60-120 字
    evidence: string;         // 也要 grounded
  };
  /** 1 个进化方向 · 这个主型未来可能往哪个相邻型转 */
  growthDirection: {
    towardType: DecisionPersonalityType;
    description: string;      // 60-100 字 · 为什么 / 怎样会发生
  };
  /** Meta · 生成时间 / 用了哪些 onboarding stage */
  generatedAt: number;
  basedOnStages: string[];
  llmModel: string;
}
