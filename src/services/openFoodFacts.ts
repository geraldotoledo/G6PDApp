import { analyzeIngredientsText } from '../engine/ruleEngine.ts';
import { AnalysisResult, ProfileMode } from '../engine/types.ts';

export interface OpenFoodFactsProduct {
  code: string;
  productName: string;
  brands: string;
  ingredientsText: string;
  imageUrl?: string;
  additives?: string[];
}

export interface ProductLookupResult {
  found: boolean;
  product?: OpenFoodFactsProduct;
  analysis?: AnalysisResult;
  silentReformulationWarning: boolean;
  message: string;
}

const CACHE_PREFIX = 'g6pd_off_cache_';

/**
 * Consulta a API pública gratuita do Open Food Facts diretamente do celular do usuário (R$ 0,00)
 */
export async function lookupProductByBarcode(
  ean: string,
  profileMode: ProfileMode = 'BRAZIL_PEDIATRIC'
): Promise<ProductLookupResult> {
  const cleanEan = ean.trim().replace(/\D/g, '');
  if (!cleanEan) {
    return {
      found: false,
      silentReformulationWarning: false,
      message: 'Código de barras inválido.'
    };
  }

  // 1. Checar cache local do aparelho
  const cached = localStorage.getItem(`${CACHE_PREFIX}${cleanEan}`);
  if (cached) {
    try {
      const parsed: OpenFoodFactsProduct = JSON.parse(cached);
      return evaluateProduct(parsed, profileMode, true);
    } catch {
      localStorage.removeItem(`${CACHE_PREFIX}${cleanEan}`);
    }
  }

  // 2. Consulta à API pública com timeout de segurança
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${cleanEan}.json?fields=code,product_name,product_name_pt,brands,ingredients_text,ingredients_text_pt,additives_tags,image_front_small_url`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'G6PDApp-HealthCheck - Web - Version 1.0 - g6pd.app'
        }
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        found: false,
        silentReformulationWarning: false,
        message: 'Produto não encontrado na base pública do Open Food Facts.'
      };
    }

    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return {
        found: false,
        silentReformulationWarning: false,
        message: 'Código de barras não cadastrado na base pública colaborativa.'
      };
    }

    const prod = data.product;
    const name = prod.product_name_pt || prod.product_name || 'Produto sem nome';
    const brands = prod.brands || 'Marca não informada';
    const ingredients = prod.ingredients_text_pt || prod.ingredients_text || '';
    const imageUrl = prod.image_front_small_url;

    const formattedProduct: OpenFoodFactsProduct = {
      code: cleanEan,
      productName: name,
      brands,
      ingredientsText: ingredients,
      imageUrl,
      additives: prod.additives_tags || []
    };

    // Salvar no cache local do dispositivo
    try {
      localStorage.setItem(`${CACHE_PREFIX}${cleanEan}`, JSON.stringify(formattedProduct));
    } catch {
      // Quota de localStorage cheia; continuar sem travar
    }

    return evaluateProduct(formattedProduct, profileMode, false);
  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    return {
      found: false,
      silentReformulationWarning: false,
      message: isAbort
        ? 'A consulta ao banco de dados online demorou muito. Verifique sua conexão à internet.'
        : 'Não foi possível consultar a base online no momento. Use a foto do rótulo para análise offline.'
    };
  }
}

/**
 * Avalia os ingredientes do produto com o Motor Determinístico e aplica a
 * Trava de Segurança contra Reformulação Silenciosa de Fábrica.
 */
function evaluateProduct(
  product: OpenFoodFactsProduct,
  profileMode: ProfileMode,
  fromCache: boolean
): ProductLookupResult {
  // Se a base online não tiver a lista de ingredientes
  if (!product.ingredientsText || product.ingredientsText.trim().length === 0) {
    return {
      found: true,
      product,
      silentReformulationWarning: true,
      message: `Produto localizado ("${product.productName}"), mas a base pública não possui a lista de ingredientes cadastrada. Por favor, tire uma foto da lista de ingredientes na embalagem física.`
    };
  }

  // Analisar os ingredientes retornados com o Motor de Regras
  const analysis = analyzeIngredientsText(product.ingredientsText, {
    profileMode,
    isSearchQuery: true // O texto do Open Food Facts pode não ter os avisos de início/fim de pacote
  });

  const isRed = analysis.status === 'RED_BLOCKED';

  let message = '';
  if (isRed) {
    message = `🔴 ALERTA VERMELHO: A base online indica que este produto contém ingredientes restritos para G6PD.`;
  } else {
    message = `🟢 Aparentemente seguro na base pública colaborativa. Atenção: fabricantes podem mudar a fórmula na fábrica sem mudar o código de barras. Para 100% de segurança, confira o rótulo físico.`;
  }

  if (fromCache) {
    message += ' (Dados carregados da memória do aparelho).';
  }

  return {
    found: true,
    product,
    analysis,
    silentReformulationWarning: !isRed,
    message
  };
}
