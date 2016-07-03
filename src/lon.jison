%lex
%%

[0-9a-z]+(?=[,:\]\}$])  return 'INDEX'
\-?(?:[1-9][0-9]+|[0-9])(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?   return 'NUMBER'
\"(?:[^\"\\]|\\[\"\/\\bfnrt]|\\u[0-9a-fA-F]{4})*\"          return 'STRING'
"t"                     return 'TRUE'
"f"                     return 'FALSE'
"u"                     return 'UNDEFINED'
"n"                     return 'NULL'
"N"                     return 'NAN'
"i"                     return 'INFINITY'
"I"                     return '-INFINITY'
[_a-zA-Z][_a-zA-Z0-9]*  return 'IDENTIFIER'
","                     return ','
":"                     return ':'
"{"                     return '{'
"}"                     return '}'
"["                     return '['
"]"                     return ']'
<<EOF>>                 return 'EOF'
.                       return 'INVALID'

/lex
%start root
%%

root
    : values EOF    {return $1}
    ;

values
    : value             {$$ = [$1]}
    | values "," value  {$$ = $1; $1.push($3)}
    ;

value
    : keyword   {$$ = $1}
    | array     {$$ = $1}
    | object    {$$ = $1}
    | instance  {$$ = $1}
    | INDEX     {$$ = parseInt($1)}
    | NUMBER    {$$ = parseFloat($1)}
    | STRING    {$$ = JSON.parse($1)}
    ;

keyword
    : TRUE          {$$ = true}
    | FALSE         {$$ = false}
    | UNDEFINED     {$$ = yy.u}
    | NULL          {$$ = yy.n}
    | NAN           {$$ = yy.N}
    | INFINITY      {$$ = yy.i}
    | "-INFINITY"   {$$ = yy.I}
    ;

name
    : TRUE          {$$ = $1}
    | FALSE         {$$ = $1}
    | UNDEFINED     {$$ = $1}
    | NULL          {$$ = $1}
    | NAN           {$$ = $1}
    | INFINITY      {$$ = $1}
    | "-INFINITY"   {$$ = $1}
    | IDENTIFIER    {$$ = $1}
    ;

array
    : "[" "]"                       {$$ = []}
    | "[" void "]"                  {$$ = $2}
    | "[" array_items "]"           {$$ = $2}
    | "[" array_items "," "]"       {$$ = $2}
    | "[" array_items "," void "]"  {$$ = $2.concat($4)}
    ;

array_items
    : array_item                        {$$ = [$1]}
    | void array_item                   {$$ = $1; $1.push($2)}
    | array_items "," array_item        {$$ = $1; $1.push($3)}
    | array_items "," void array_item   {$$ = $1.concat($3).concat($4)}
    ;

array_item
    : keyword   {$$ = $1}
    | INDEX     {$$ = parseInt($1, 36)}
    ;

void
    : ","       {$$ = [yy.v]}
    | void ","  {$$ = $1; $1.push(yy.v)}
    ;

object
    : "{" "}"               {$$ = {ks: [], vs: []}}
    | "{" object_items "}"  {$$ = $2}
    ;

object_items
    : object_item                   {$$ = {ks: [$1.k], vs: [$1.v]}}
    | object_items "," object_item  {$$ = $1; $1.ks.push($3.k); $1.vs.push($3.v)}
    ;

object_item
    : INDEX ":" INDEX       {$$ = {k: parseInt($1, 36), v: parseInt($3, 36)}}
    | INDEX ":" keyword     {$$ = {k: parseInt($1, 36), v: $3}}
    ;

instance
    : name object   {$$ = yy.bindClass($2, $1)}
    ;
