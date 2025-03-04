<?xml version="1.0" encoding="UTF-8"?>
<sld:UserStyle xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">
  <sld:Name>AtlasStyler 1.9</sld:Name>
  <sld:Title/>
  <sld:FeatureTypeStyle>
    <sld:Name>QUANTITIES_COLORIZED_LINE:VALUE#slope:NORM#null:METHOD#QUANTILES:PALETTE#PuBuGn</sld:Name>
    <sld:Title>GraduatedColorLineRuleList</sld:Title>
    <sld:FeatureTypeName>Feature</sld:FeatureTypeName>
    <sld:Rule>
      <sld:Name>AS: 1/4 GraduatedColorLineRuleList</sld:Name>
      <sld:Title>0-4 Degrees</sld:Title>
      <ogc:Filter>
        <ogc:And>
          <ogc:PropertyIsEqualTo>
            <ogc:Literal>ALL_LABEL_CLASSES_ENABLED</ogc:Literal>
            <ogc:Literal>ALL_LABEL_CLASSES_ENABLED</ogc:Literal>
          </ogc:PropertyIsEqualTo>
          <ogc:And>
            <ogc:Not>
              <ogc:And>
                <ogc:PropertyIsEqualTo>
                  <ogc:Literal>ALL_LABEL_CLASSES_ENABLED</ogc:Literal>
                  <ogc:Literal>ALL_LABEL_CLASSES_ENABLED</ogc:Literal>
                </ogc:PropertyIsEqualTo>
                <ogc:Or>
                  <ogc:PropertyIsNull>
                    <ogc:PropertyName>slope</ogc:PropertyName>
                  </ogc:PropertyIsNull>
                  <ogc:PropertyIsEqualTo>
                    <ogc:Literal>NEVER</ogc:Literal>
                    <ogc:Literal>TRUE</ogc:Literal>
                  </ogc:PropertyIsEqualTo>
                </ogc:Or>
              </ogc:And>
            </ogc:Not>
            <ogc:PropertyIsBetween>
              <ogc:PropertyName>slope</ogc:PropertyName>
              <ogc:LowerBoundary>
                <ogc:Literal>0</ogc:Literal>
              </ogc:LowerBoundary>
              <ogc:UpperBoundary>
                <ogc:Literal>4</ogc:Literal>
              </ogc:UpperBoundary>
            </ogc:PropertyIsBetween>
          </ogc:And>
        </ogc:And>
      </ogc:Filter>
      <sld:MaxScaleDenominator>1.7976931348623157E308</sld:MaxScaleDenominator>
      <sld:LineSymbolizer>
        <sld:Geometry>
          <ogc:PropertyName>geom</ogc:PropertyName>
        </sld:Geometry>
        <sld:Stroke>
          <sld:CssParameter name="stroke">#F6EFF7</sld:CssParameter>
        </sld:Stroke>
      </sld:LineSymbolizer>
    </sld:Rule>
    <sld:Rule>
      <sld:Name>AS: 2/4 GraduatedColorLineRuleList</sld:Name>
      <sld:Title>4-10 Degrees</sld:Title>
      <ogc:Filter>
        <ogc:And>
          <ogc:PropertyIsEqualTo>
            <ogc:Literal>ALL_LABEL_CLASSES_ENABLED</ogc:Literal>
            <ogc:Literal>ALL_LABEL_CLASSES_ENABLED</ogc:Literal>
          </ogc:PropertyIsEqualTo>
          <ogc:And>
            <ogc:Not>
              <ogc:And>
                <ogc:PropertyIsEqualTo>
                  <ogc:Literal>ALL_LABEL_CLASSES_ENABLED</ogc:Literal>
                  <ogc:Literal>ALL_LABEL_CLASSES_ENABLED</ogc:Literal>
                </ogc:PropertyIsEqualTo>
                <ogc:Or>
                  <ogc:PropertyIsNull>
                    <ogc:PropertyName>slope</ogc:PropertyName>
                  </ogc:PropertyIsNull>
                  <ogc:PropertyIsEqualTo>
                    <ogc:Literal>NEVER</ogc:Literal>
                    <ogc:Literal>TRUE</ogc:Literal>
                  </ogc:PropertyIsEqualTo>
                </ogc:Or>
              </ogc:And>
            </ogc:Not>
            <ogc:PropertyIsBetween>
              <ogc:PropertyName>slope</ogc:PropertyName>
              <ogc:LowerBoundary>
                <ogc:Literal>4</ogc:Literal>
              </ogc:LowerBoundary>
              <ogc:UpperBoundary>
                <ogc:Literal>10</ogc:Literal>
              </ogc:UpperBoundary>
            </ogc:PropertyIsBetween>
          </ogc:And>
        </ogc:And>
      </ogc:Filter>
      <sld:MaxScaleDenominator>1.7976931348623157E308</sld:MaxScaleDenominator>
      <sld:LineSymbolizer>
        <sld:Geometry>
          <ogc:PropertyName>geom</ogc:PropertyName>
        </sld:Geometry>
        <sld:Stroke>
          <sld:CssParameter name="stroke">#BDC9E1</sld:CssParameter>
        </sld:Stroke>
      </sld:LineSymbolizer>
    </sld:Rule>
    <sld:Rule>
      <sld:Name>AS: 3/4 GraduatedColorLineRuleList</sld:Name>
      <sld:Title>10-20 Degrees</sld:Title>
      <ogc:Filter>
        <ogc:And>
          <ogc:PropertyIsEqualTo>
            <ogc:Literal>ALL_LABEL_CLASSES_ENABLED</ogc:Literal>
            <ogc:Literal>ALL_LABEL_CLASSES_ENABLED</ogc:Literal>
          </ogc:PropertyIsEqualTo>
          <ogc:And>
            <ogc:Not>
              <ogc:And>
                <ogc:PropertyIsEqualTo>
                  <ogc:Literal>ALL_LABEL_CLASSES_ENABLED</ogc:Literal>
                  <ogc:Literal>ALL_LABEL_CLASSES_ENABLED</ogc:Literal>
                </ogc:PropertyIsEqualTo>
                <ogc:Or>
                  <ogc:PropertyIsNull>
                    <ogc:PropertyName>slope</ogc:PropertyName>
                  </ogc:PropertyIsNull>
                  <ogc:PropertyIsEqualTo>
                    <ogc:Literal>NEVER</ogc:Literal>
                    <ogc:Literal>TRUE</ogc:Literal>
                  </ogc:PropertyIsEqualTo>
                </ogc:Or>
              </ogc:And>
            </ogc:Not>
            <ogc:PropertyIsBetween>
              <ogc:PropertyName>slope</ogc:PropertyName>
              <ogc:LowerBoundary>
                <ogc:Literal>10</ogc:Literal>
              </ogc:LowerBoundary>
              <ogc:UpperBoundary>
                <ogc:Literal>20</ogc:Literal>
              </ogc:UpperBoundary>
            </ogc:PropertyIsBetween>
          </ogc:And>
        </ogc:And>
      </ogc:Filter>
      <sld:MaxScaleDenominator>1.7976931348623157E308</sld:MaxScaleDenominator>
      <sld:LineSymbolizer>
        <sld:Geometry>
          <ogc:PropertyName>geom</ogc:PropertyName>
        </sld:Geometry>
        <sld:Stroke>
          <sld:CssParameter name="stroke">#74A9CF</sld:CssParameter>
        </sld:Stroke>
      </sld:LineSymbolizer>
    </sld:Rule>
    <sld:Rule>
      <sld:Name>AS: 4/4 GraduatedColorLineRuleList</sld:Name>
      <sld:Title>20-81 Degrees</sld:Title>
      <ogc:Filter>
        <ogc:And>
          <ogc:PropertyIsEqualTo>
            <ogc:Literal>ALL_LABEL_CLASSES_ENABLED</ogc:Literal>
            <ogc:Literal>ALL_LABEL_CLASSES_ENABLED</ogc:Literal>
          </ogc:PropertyIsEqualTo>
          <ogc:And>
            <ogc:Not>
              <ogc:And>
                <ogc:PropertyIsEqualTo>
                  <ogc:Literal>ALL_LABEL_CLASSES_ENABLED</ogc:Literal>
                  <ogc:Literal>ALL_LABEL_CLASSES_ENABLED</ogc:Literal>
                </ogc:PropertyIsEqualTo>
                <ogc:Or>
                  <ogc:PropertyIsNull>
                    <ogc:PropertyName>slope</ogc:PropertyName>
                  </ogc:PropertyIsNull>
                  <ogc:PropertyIsEqualTo>
                    <ogc:Literal>NEVER</ogc:Literal>
                    <ogc:Literal>TRUE</ogc:Literal>
                  </ogc:PropertyIsEqualTo>
                </ogc:Or>
              </ogc:And>
            </ogc:Not>
            <ogc:PropertyIsBetween>
              <ogc:PropertyName>slope</ogc:PropertyName>
              <ogc:LowerBoundary>
                <ogc:Literal>20</ogc:Literal>
              </ogc:LowerBoundary>
              <ogc:UpperBoundary>
                <ogc:Literal>81</ogc:Literal>
              </ogc:UpperBoundary>
            </ogc:PropertyIsBetween>
          </ogc:And>
        </ogc:And>
      </ogc:Filter>
      <sld:MaxScaleDenominator>1.7976931348623157E308</sld:MaxScaleDenominator>
      <sld:LineSymbolizer>
        <sld:Geometry>
          <ogc:PropertyName>geom</ogc:PropertyName>
        </sld:Geometry>
        <sld:Stroke>
          <sld:CssParameter name="stroke">#02818A</sld:CssParameter>
        </sld:Stroke>
      </sld:LineSymbolizer>
    </sld:Rule>
  </sld:FeatureTypeStyle>
</sld:UserStyle>